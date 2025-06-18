import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChatComponent } from "../../chat/chat.component";

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [RouterLink, ChatComponent],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss'
})
export class NotfoundComponent {

}
