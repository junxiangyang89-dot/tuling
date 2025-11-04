import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // 用于双向绑定
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MachinePageComponent } from './components/machine-page/machine-page.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { TuringMachineComponent } from './components/turing-machine/turing-machine.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { FreeModeComponent } from './components/free-mode/free-mode.component';
import { LearningModeComponent } from './components/learning-mode/learning-mode.component';
import { ChallengeModeComponent } from './components/challenge-mode/challenge-mode.component';
import { StateEditorComponent } from './components/state-editor/state-editor.component';
import { ChatAssistantComponent } from './components/chat-assistant/chat-assistant.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
  ],
  declarations: [
    AppComponent,
    UserRegisterComponent,
    TuringMachineComponent,
    WelcomeComponent,
    FreeModeComponent,
    LearningModeComponent,
    ChallengeModeComponent,
    MachinePageComponent,
    StateEditorComponent,
    ChatAssistantComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
