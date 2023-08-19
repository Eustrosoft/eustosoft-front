/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Component, inject, OnInit } from '@angular/core';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { PRECONFIGURED_TRANSLATE_SERVICE } from '@eustrosoft-front/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ChatMessage } from './support-chat/interfaces/chat-message.interface';
import { User } from './support-chat/interfaces/user.interface';
import { Chat } from './support-chat/interfaces/chat.interface';
import { LocalDbNameEnum } from './support-chat/constants/enums/local-db-name.enum';
import { MockService } from './support-chat/services/mock.service';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private mockService = inject(MockService);
  public config = inject(APP_CONFIG);
  public translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);

  public translatedValues!: Observable<{
    title: string;
    appName: string;
    appsButtonText: string;
    login: string;
    dispatcher: string;
    appsPage: string;
  }>;

  ngOnInit(): void {
    this.translatedValues = combineLatest([
      this.translateService.get('HEADER.TITLE'),
      this.translateService.get('HEADER.APP_NAME'),
      this.translateService.get('HEADER.APPS_BUTTON_TEXT'),
      this.translateService.get('HEADER.APPS.LOGIN'),
      this.translateService.get('HEADER.APPS.DISPATCHER'),
      this.translateService.get('HEADER.APPS.ALL_APPS_PAGE'),
    ]).pipe(
      map(([title, appName, appsButtonText, login, dispatcher, appsPage]) => ({
        title,
        appName,
        appsButtonText,
        login,
        dispatcher,
        appsPage,
      }))
    );
    this.generateLocalStorageMock();
  }

  generateLocalStorageMock(): void {
    if (
      localStorage.getItem(LocalDbNameEnum.TIS_MESSAGE) &&
      localStorage.getItem(LocalDbNameEnum.TIS_TICKET)
    ) {
      return;
    }

    const users: User[] = this.mockService.generateMockUsers(10);
    const chats: Chat[] = [];
    const messages: ChatMessage[] = [];

    // Generate 25 tickets
    for (let i = 1; i <= 25; i++) {
      const chatUsers = this.mockService.getRandomUsers(
        users,
        Math.floor(Math.random() * 9) + 2
      );

      const ticket: Chat = {
        id: i,
        name: `Ticket №${i}`,
        time_created: this.mockService.getRandomDate(),
        owner: this.mockService.getRandomUsers(users, 1)[0],
        users: chatUsers,
        active: this.mockService.getRandomBoolean(),
      };
      chats.push(ticket);

      // Generate 5 to 10 messages for each ticket
      const numOfMessages = Math.floor(Math.random() * 6) + 5; // Random between 5 and 10
      for (let j = 1; j <= numOfMessages; j++) {
        // Add some random long text for some messages
        const user = this.mockService.getRandomUsers(chatUsers, 1)[0];
        let messageText = `Message ${j} for Ticket ${i} from ${user.name}`;
        if (Math.random() < 0.2) {
          messageText += this.mockService.generateRandomLongText();
        }
        const message: ChatMessage = {
          id: messages.length + 1,
          chat_id: i,
          user_id: user.id,
          user_name: user.name,
          text: messageText,
          content: null,
          time_created: this.mockService.getRandomDateTime(),
          time_changed: '',
        };
        messages.push(message);
      }
    }

    // Store the mock data in localStorage
    localStorage.setItem(LocalDbNameEnum.TIS_TICKET, JSON.stringify(chats));
    localStorage.setItem(LocalDbNameEnum.TIS_MESSAGE, JSON.stringify(messages));
  }
}
