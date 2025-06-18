import { CommonModule } from '@angular/common';
import { ChatbotService } from './../chatbot.service';
import { Component, ElementRef, NgModule, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule , FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

isOpen: boolean = false;
  userMessage: string = '';
  chatHistory: { sender: string, message: string }[] = [];

  @ViewChild('chatMessages') chatMessages!: ElementRef;

  constructor(public chatbotService: ChatbotService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendMessage() {
    if (this.userMessage.trim()) {
      this.chatHistory.push({ sender: 'You', message: this.userMessage });
      const response = this.chatbotService.getResponse(this.userMessage);
      this.chatHistory.push({ sender: 'Bot', message: response });
      this.userMessage = '';
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  selectSuggestedQuestion(question: string) {
    if (question.trim()) {
      this.userMessage = question;
      this.sendMessage();
    }
  }

  private scrollToBottom() {
    if (this.chatMessages) {
      const element = this.chatMessages.nativeElement;
      element.scrollTop = element.scrollHeight;
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    }
  }
}