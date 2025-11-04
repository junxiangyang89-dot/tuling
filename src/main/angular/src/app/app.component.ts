import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { TuringMachineComponent } from './components/turing-machine/turing-machine.component';
// import { TuringMachineManagerComponent } from './components/turing-machine-manager/turing-machine-manager.component';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
// import { UserRegisterComponent } from './components/user-register/user-register.component';
// import { MachinePageComponent } from './components/machine-page/machine-page.component';

interface ApiResponse {
  code: number;
  msg?: string;
  data?: {
    token?: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule, 
    HttpClientModule, 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'turing-machine';
  isLoggedIn: boolean = false;
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    // 检查路由参数中是否有登录标志
    this.route.queryParams.subscribe((params: { [key: string]: string }) => {
      if (params['logged'] === 'true') {
        this.isLoggedIn = true;
      }
    });
    
    // 检查本地存储中是否有token
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }
}