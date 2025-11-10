// state-editor.component.ts
import { Component, ViewEncapsulation,Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3';
import { TransitionRule } from '../../models/transitionrule.model';
import { CommonModule } from '@angular/common';

import { SimpleChanges } from '@angular/core';


interface StateNode extends SimulationNodeDatum {
  id: string;
  type: 'initial' | 'accept' | 'normal';
  x?: number;
  y?: number;
}

interface TransitionLink extends SimulationLinkDatum<StateNode> {
  source: string;
  target: string;
  rule: TransitionRule;
}

@Component({
  selector: 'app-state-editor',
  imports: [CommonModule],
  templateUrl: './state-editor.component.html',
  styleUrls: ['./state-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class StateEditorComponent implements AfterViewInit {
  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;
  @Input() currentMode: string = "";
  @Input() currentState: string = 'q0';
  @Input() transitionRules: TransitionRule[] = [];
  @Input() availableStates: string[] = [];
  @Output() addState = new EventEmitter<string>();
  @Output() addRule = new EventEmitter<TransitionRule>();
  @Output() updateRule = new EventEmitter<TransitionRule>();
  @Output() deleteRule = new EventEmitter<TransitionRule>();
  private svg: any;

  private simulation!: Simulation<StateNode, TransitionLink>;
  private nodes: StateNode[] = [];
  private links: TransitionLink[] = [];
  private drag: any;
  private selectedNode: StateNode | null = null;
  private creatingLink: {source: string, x: number, y: number} | null = null;

  showHelp = false;
  zoomLevel = 1;
  private contextMenu = {
    show: false,
    x: 0,
    y: 0,
    node: null as StateNode | null
  };

  private initEditor() {
    const container = this.editorContainer.nativeElement;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    console.log(width+" "+height);

    // 清除现有SVG
    container.innerHTML = '';

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // 添加箭头标记
    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 33)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#90a4ae');

    // 添加上下文菜单事件
    this.svg.on('contextmenu', (event: MouseEvent) => {
      event.preventDefault();
      this.hideContextMenu();
    });


    // 初始化力导向图模拟
    this.simulation = d3.forceSimulation<StateNode>()
      .force('charge', d3.forceManyBody()
        .strength(-300)  // 减少排斥力强度
        .distanceMin(10) // 添加最小距离
        .distanceMax(30)) // 添加最大距离
      .force('link', d3.forceLink()
        .id((d: any) => d.id)
        .distance(150)  // 增加连接距离
        .iterations(5)) // 增加迭代次数
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.05)  // 减慢衰减速度
      .alphaTarget(0.3); // 设置目标alpha值

    // 拖拽行为
    this.drag = d3.drag<SVGGElement, StateNode>()
      .on('start', (event, d) => this.dragStarted(event, d))
      .on('drag', (event, d) => this.dragged(event, d))
      .on('end', (event, d) => this.dragEnded(event, d));

    // 画布点击事件
    this.svg.on('click', (event: MouseEvent) => {
      // 仅在非学习模式下允许添加状态
      if (!event.defaultPrevented && !this.creatingLink && this.currentMode !== 'learning-mode') {
        this.showAddStateDialog(event);
      }
    });
  }

  // 在 StateEditorComponent 类中添加
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentState'] || changes['transitionRules'] || changes['availableStates']) {
      this.updateGraph();
    }
  }

  ngAfterViewInit() {
    this.initEditor();
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  resetZoom() {
    this.zoomLevel = 1;
    this.applyZoom();
    this.updateGraph();
  }

  private applyZoom() {
    this.svg.transition()
      .duration(250)
      .call(d3.zoom().transform, d3.zoomIdentity.scale(this.zoomLevel));
  }

  private hideContextMenu() {
    this.contextMenu.show = false;
  }

  public updateGraph() {
    if (!this.editorContainer?.nativeElement) {
      // DOM 还没加载完成，跳过
      return;
    }
    // 更新节点数据
    this.nodes = this.availableStates.map(state => ({
      id: state,
      type: state === 'q0' ? 'initial' :
        state === 'qAccept' ? 'accept' : 'normal',
      x: Math.random() * this.editorContainer.nativeElement.offsetWidth * 0.8 + 50,
      y: Math.random() * 400 + 50,
      labelY: 30
    }));

    // 更新连线数据
    this.links = this.transitionRules.map(rule => ({
      source: rule.currentState,
      target: rule.nextState,
      rule: rule
    }));

    // 绘制图形
    this.drawGraph();
  }


  private drawGraph() {
    if (this.simulation) {
      this.simulation.stop();
    }
    // 清除旧元素
    this.svg.selectAll('.link, .node').remove();
    const svgElement = this.svg.node() as SVGSVGElement;
    const width = svgElement?.clientWidth || 800;
    const height = svgElement?.clientHeight || 600;

    // 初始化力导向布局
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));


    // 绘制连线 - 使用弧形路径
      const link = this.svg.selectAll('.link')
        .data(this.links, (d: any) => `${d.source}-${d.target}-${d.rule.inputSymbol}`)
        .enter()
        .append('g')
        .attr('class', 'link');

    link.append('path')
      .attr('class', 'link-path')
      .attr('marker-end', 'url(#arrowhead)')
      .attr('d', (d: any) => {
        const sourceNode = this.nodes.find(n => n.id === d.source);
        const targetNode = this.nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return '';

        // 自环：绘制弧形路径
        if (d.source === d.target) {
          const r = 40;
          return `
          M ${sourceNode.x} ${sourceNode.y! - 30}
          a ${r},${r} 0 1,1 1,0.0001
        `;
        }

        // 计算起点和终点（考虑节点半径）
        const dx = targetNode.x! - sourceNode.x!;
        const dy = targetNode.y! - sourceNode.y!;
        const angle = Math.atan2(dy, dx);

        const sourceX = sourceNode.x! + 30 * Math.cos(angle);
        const sourceY = sourceNode.y! + 30 * Math.sin(angle);
        const targetX = targetNode.x! - 30 * Math.cos(angle);
        const targetY = targetNode.y! - 30 * Math.sin(angle);

        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      });

    link.append('text')
      .attr('class', 'link-label')
      .attr('dy', -5)
      .attr('text-anchor', 'middle')
      .attr('transform', (d: any) => {
        const sourceNode = this.nodes.find(n => n.id === d.source);
        const targetNode = this.nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return '';

        if (d.source === d.target) {
          // 自环：文字在节点上方偏移显示
          return `translate(${sourceNode.x},${sourceNode.y!+800})`;
        }

        const midX = (sourceNode.x! + targetNode.x!) / 2;
        const midY = (sourceNode.y! + targetNode.y!) / 2;
        return `translate(${midX},${midY})`;
      })
      // 修改逻辑以确保outputSymbol即使为空字符串或空格也能正确显示
        .text((d: any) => `${d.rule.inputSymbol}/${d.rule.outputSymbol === undefined ? '' : d.rule.outputSymbol },${d.rule.moveDirection? d.rule.moveDirection :''}`);

      // 绘制节点
      const node = this.svg.selectAll('.node')
        .data(this.nodes, (d: any) => d.id)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
        .call(this.drag)
        .on('click', (event:any, d:any) => this.onNodeClick(event, d));

      node.append('circle')
        .attr('r', 30)
        .attr('class', (d: any) => `node-circle ${d.type}`);

    node.append('text')
      .attr('class', 'node-label')
      .attr('dy', 5)
      .text((d: any) => d.id);

      // 高亮当前状态
      this.svg.selectAll('.node-circle')
        .classed('current', (d: any) => d.id === this.currentState);

    // 添加tick事件处理 - 确保连线随节点移动
    this.simulation.on('tick', () => {
      this.svg.selectAll('.link-path')
        .attr('d', (d: any) => {
          // const sourceNode = this.nodes.find(n => n.id === d.source);
          // const targetNode = this.nodes.find(n => n.id === d.target);
          const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.id === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.id === d.target);

          if (!sourceNode || !targetNode) return '';

          if (d.source === d.target) {
            const r = 40;
            return `
            M ${sourceNode.x} ${sourceNode.y! - 30}
            a ${r},${r} 0 1,1 1,0.0001
          `;
          }

          const dx = targetNode.x! - sourceNode.x!;
          const dy = targetNode.y! - sourceNode.y!;
          const angle = Math.atan2(dy, dx);

          const sourceX = sourceNode.x! + 30 * Math.cos(angle);
          const sourceY = sourceNode.y! + 30 * Math.sin(angle);
          const targetX = targetNode.x! - 30 * Math.cos(angle);
          const targetY = targetNode.y! - 30 * Math.sin(angle);

          return `M${sourceX},${sourceY}L${targetX},${targetY}`;
        });

      this.svg.selectAll('.link-label')
        .attr('transform', (d: any) => {
          const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.id === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.id === d.target);
          if (!sourceNode || !targetNode) return '';

          const midX = (sourceNode.x! + targetNode.x!) / 2;
          const midY = (sourceNode.y! + targetNode.y!) / 2;
          return `translate(${midX},${midY})`;
        });

      this.svg.selectAll('.node')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

  }
  // 交互方法
  private draggedSourceNode: StateNode | null = null;

  private dragStarted(event: any, d: StateNode) {
    this.draggedSourceNode = d;  // 保存源节点
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    this.selectedNode = d;
    console.log('StateNode:', this.draggedSourceNode);
  }

  private dragged(event: any, d: StateNode) {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(event: any, d: StateNode) {
    if (!event.active) this.simulation.alphaTarget(0);

    d.fx = null;
    d.fy = null;

    const [x, y] = d3.pointer(event, this.svg.node());

    // 查找是否有结点在当前鼠标位置附近
    const targetNode = this.nodes.find(n => {
      if (n.id === d.id) return false; // 忽略自身
      const dx = (n.x! - x);
      const dy = (n.y! - y);
      return Math.sqrt(dx * dx + dy * dy) < 40;  // 距离阈值
    });
    // 如果松开在其他节点上，就创建转移规则
    if (this.draggedSourceNode && targetNode) {
      console.log('targetNode:', targetNode);
      const inputSymbol = prompt(`创建转移规则 ${this.draggedSourceNode.id} -> ${targetNode.id}，请输入输入符号：`);
      const outputSymbol = prompt(`请输入写入符号：`, inputSymbol || '');
      const direction = prompt(`请输入方向（L/R/S）：`, 'R');

      // 验证输入符号和输出符号
      const validSymbols = ['0', '1', ' ', '+', '*'];
      if (inputSymbol && outputSymbol && direction) {
        // 输入符号验证
        if (!validSymbols.includes(inputSymbol)) {
          alert('读符号必须是 0、1、+、*或 空格');
          return;
        }
        // 输出符号验证
        if (!validSymbols.includes(outputSymbol)) {
          alert('写符号必须是 0、1、+、*或 空格');
          return;
        }
        // 方向验证
        const validDirections = ['L', 'R', 'S'];
        const normalizedDirection = direction.toUpperCase();
        if (!validDirections.includes(normalizedDirection)) {
          alert('方向必须是 L、R 或 S');
          return;
        }

        const newRule: TransitionRule = {
          currentState: this.draggedSourceNode.id,
          inputSymbol,
          outputSymbol,
          moveDirection: normalizedDirection as 'L' | 'R' | 'S',
          nextState: targetNode.id,
          iswrite: true // 添加iswrite属性，默认为true
        };
        this.addRule.emit(newRule);
      }
    }

    this.draggedSourceNode = null;
  }

  private showAddStateDialog(event: MouseEvent) {
    const stateName = prompt('输入状态名称:');
    if (stateName && !this.availableStates.includes(stateName)) {
      const type = prompt('状态类型？输入 initial / accept / normal', 'normal') as 'initial' | 'accept' | 'normal';
      this.addState.emit(stateName);
      this.updateGraph();
    }
  }

  addTransitionMode: boolean = false;
  transitionStartNode: StateNode | null = null;

  onAddTransitionClick() {
    this.addTransitionMode = true;
    this.transitionStartNode = null;
    alert('请选择起始状态');
  }

  onNodeClick(event: MouseEvent, node: StateNode) {
    event.stopPropagation();

    if (!this.addTransitionMode) return;

    if (!this.transitionStartNode) {
      this.transitionStartNode = node;
      alert('请点击目标状态');
    } else {
      const from = this.transitionStartNode.id;
      const to = node.id;

      // 弹出对话框获取 path 和 label
      const inputSymbol = prompt(`输入 input symbol 从 ${from} 到 ${to}`);
      const writeSymbol = prompt(`输入 out symbol 从 ${from} 到 ${to}`);
      const direction = prompt(`输入方向 (L/R/S)`);

      // 验证输入符号和输出符号
      const validSymbols = ['0', '1', ' ', '+', '*'];
      if (inputSymbol && writeSymbol && direction) {
        // 输入符号验证
        if (!validSymbols.includes(inputSymbol)) {
          alert('读符号必须是 0、1、+、*或 空格');
          return;
        }
        // 输出符号验证
        if (!validSymbols.includes(writeSymbol)) {
          alert('写符号必须是 0、1、+、*或 空格');
          return;
        }
        // 方向验证
        const validDirections = ['L', 'R', 'S'];
        const normalizedDirection = direction.toUpperCase();
        if (!validDirections.includes(normalizedDirection)) {
          alert('方向必须是 L、R 或 S');
          return;
        }

        const newRule: TransitionRule = {
          currentState: from,
          nextState: to,
          inputSymbol: inputSymbol,
          outputSymbol: writeSymbol,
          moveDirection: normalizedDirection as 'L' | 'R' | 'S',
          iswrite: true // 添加iswrite属性，默认为true
        };
        this.transitionRules = [...this.transitionRules, newRule];
        this.addRule.emit(newRule); // 通知父组件添加
        this.addTransitionMode = false;
        this.transitionStartNode = null;
        alert('连接已添加');
        this.updateGraph();
      } else {
        // 输入不完整，取消操作
        this.addTransitionMode = false;
        this.transitionStartNode = null;
        alert('输入不完整，连接创建已取消');
      }
    }
  }

}
