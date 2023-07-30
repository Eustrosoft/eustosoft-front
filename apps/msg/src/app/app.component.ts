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
import { TicketMessage } from './support-chat/interfaces/ticket-message.interface';
import { User } from './support-chat/interfaces/user.interface';
import { Ticket } from './support-chat/interfaces/ticket.interface';
import { LocalDbNameEnum } from './support-chat/constants/enums/local-db-name.enum';

@Component({
  selector: 'eustrosoft-front-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
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

    const users: User[] = [];
    const tickets: Ticket[] = [];
    const messages: TicketMessage[] = [];

    function getRandomUsers(users: User[], count: number): User[] {
      const randomUsers: User[] = [];
      const shuffledUsers = users.slice(); // Create a copy of the users array

      // Shuffle the array to get random users
      for (let i = shuffledUsers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledUsers[i], shuffledUsers[j]] = [
          shuffledUsers[j],
          shuffledUsers[i],
        ];
      }

      // Get the first 'count' users from the shuffled array
      for (let i = 0; i < count && i < shuffledUsers.length; i++) {
        randomUsers.push(shuffledUsers[i]);
      }

      return randomUsers;
    }

    function getRandomDate(): string {
      const startTimestamp = new Date(2023, 0, 1).getTime(); // January 1, 2023
      const endTimestamp = new Date().getTime(); // Current date
      const randomTimestamp =
        Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
      const randomDate = new Date(randomTimestamp);
      return randomDate.toISOString().slice(0, 10); // Get the date in 'YYYY-MM-DD' format
    }

    function getRandomDateTime(): string {
      const startTimestamp = new Date(2023, 0, 1).getTime(); // January 1, 2023
      const endTimestamp = new Date().getTime(); // Current date
      const randomTimestamp =
        Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
      const randomDate = new Date(randomTimestamp);
      return randomDate.toISOString(); // Get the date and time in 'YYYY-MM-DDTHH:mm:ssZ' format
    }

    function getRandomBoolean(): boolean {
      return Math.random() < 0.5; // Randomly return true or false
    }

    // Generate 10 users
    for (let userId = 1; userId <= 10; userId++) {
      const user = this.generateMockUser(userId);
      users.push(user);
    }
    // Generate 25 tickets
    for (let i = 1; i <= 25; i++) {
      const ticketUsers = getRandomUsers(
        users,
        Math.floor(Math.random() * 9) + 2
      );

      const ticket: Ticket = {
        id: i,
        name: `Ticket №${i}`,
        time_created: getRandomDate(),
        owner: getRandomUsers(users, 1)[0],
        users: ticketUsers,
        active: getRandomBoolean(),
      };
      tickets.push(ticket);

      // Generate 5 to 10 messages for each ticket
      const numOfMessages = Math.floor(Math.random() * 6) + 5; // Random between 5 and 10
      for (let j = 1; j <= numOfMessages; j++) {
        // Add some random long text for some messages
        const user = getRandomUsers(ticketUsers, 1)[0];
        let messageText = `Message ${j} for Ticket ${i} from ${user.name}`;
        if (Math.random() < 0.2) {
          messageText += this.generateRandomLongText();
        }
        const message: TicketMessage = {
          id: messages.length + 1,
          chat_id: i,
          user_id: user.id,
          user_name: user.name,
          text: messageText,
          content: null,
          time_created: getRandomDateTime(),
          time_changed: '',
        };
        messages.push(message);
      }
    }

    // Store the mock data in localStorage
    localStorage.setItem(LocalDbNameEnum.TIS_TICKET, JSON.stringify(tickets));
    localStorage.setItem(LocalDbNameEnum.TIS_MESSAGE, JSON.stringify(messages));
  }

  generateMockUser(userId: number): User {
    return {
      id: userId,
      name: `User ${userId}`,
    };
  }

  generateRandomLongText(): string {
    const words = [
      'Lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet',
      'consectetur',
      'adipiscing',
      'elit',
      'sed',
      'do',
      'eiusmod',
      'tempor',
      'incididunt',
      'ut',
      'labore',
      'et',
      'dolore',
      'magna',
      'aliqua',
      'Ut',
      'enim',
      'ad',
      'minim',
      'veniam',
      'quis',
      'nostrud',
      'exercitation',
      'ullamco',
      'laboris',
      'nisi',
      'ut',
      'aliquip',
      'ex',
      'ea',
      'commodo',
      'consequat',
      'Duis',
      'aute',
      'irure',
      'dolor',
      'in',
      'reprehenderit',
      'in',
      'voluptate',
      'velit',
      'esse',
      'cillum',
      'dolore',
      'eu',
      'fugiat',
      'nulla',
      'pariatur',
      'Excepteur',
      'sint',
      'occaecat',
      'cupidatat',
      'non',
      'proident',
      'sunt',
      'in',
      'culpa',
      'qui',
      'officia',
      'deserunt',
      'mollit',
      'anim',
      'id',
      'est',
      'laborum',
    ];

    let longText = '';

    for (let i = 0; i < 100; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      longText += words[randomIndex] + ' ';
    }

    return longText;
  }
}
