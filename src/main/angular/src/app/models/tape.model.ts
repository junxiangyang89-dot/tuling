// tape.model.ts
export class Tape {
    blank: string;
    tape: {
      before: string[];
      after: string[];
      toString: () => string;
    };

  constructor(blank: string, input: string[] = []) {
    this.blank = blank;
    // 确保输入数组中的每个元素都是有效的字符串
    input = input.map(s => String(s));
    input = input.concat([blank]);
    this.tape = {
      before: [],  // 在前面添加一个 blank
      after: input.length === 0 ? [blank] : input.slice().reverse(),
      toString: () => {
        return this.tape.before.join('')  + this.tape.after.slice().reverse().join('');
      }
    };
  }

  // 相对移动读写头：正数向右，负数向左
  moveHeadBy(offset: number): void {
    if (offset > 0) {
      for (let i = 0; i < offset; i++) {
        this.headRight();
      }
    } else if (offset < 0) {
      for (let i = 0; i < -offset; i++) {
        this.headLeft();
      }
    }
  }

    // 读取纸带头位置的符号
    read(): string {
      return this.tape.after.length > 0 ? this.tape.after[this.tape.after.length - 1] : this.blank;
    }

    // 写入纸带头位置的符号
    write(symbol: string): void {
      if (this.tape.after.length === 0) {
        this.tape.after.push(symbol);
      } else {
        this.tape.after[this.tape.after.length - 1] = symbol;
      }
    }

    // 移动纸带头向右
    headRight(): void {
      const before = this.tape.before;
      const after = this.tape.after;
      if (after.length > 0) {
        before.push(after.pop() || this.blank);
      } else {
        before.push(this.blank);
      }
    }

    // 移动纸带头向左
    headLeft(): void {
      const before = this.tape.before;
      const after = this.tape.after;
      if (before.length > 0) {
        after.push(before.pop() || this.blank);
      } else {
        after.push(this.blank);
      }
    }

    // 获取纸带的字符串表示
    toString(): string {
      return this.tape.toString();
    }

    // 读取偏移位置的符号
    readOffset(i: number): string {
      const tape = this.tape;
      if (i >= 0) {
        return (i <= tape.after.length - 1) ? tape.after[tape.after.length - 1 - i] : this.blank;
      } else {
        return (i >= -tape.before.length) ? tape.before[tape.before.length + i] : this.blank;
      }
    }

    // 获取纸带内容的数组
    getContent(): string[] {
      return [...this.tape.before, ...this.tape.after.slice().reverse()];
    }

    // 获取读写头位置
    getHeadPosition(): number {
      return this.tape.before.length;
    }

    // 设置读写头位置
    setHeadPosition(position: number): void {
      // 当前位置
      const currentPosition = this.getHeadPosition();
      // 需要移动的步数
      const steps = position - currentPosition;
      // 使用已有的方法移动读写头
      this.moveHeadBy(steps);
    }
  }
