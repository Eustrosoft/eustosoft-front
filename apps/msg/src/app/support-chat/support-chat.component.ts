/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { Author, MessageMock, TicketMock } from './ticket-mocks.interface';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements OnInit {
  tickets = this.mockChats();
  selectedTicket: TicketMock = this.tickets[0];
  isCollapsed = true;
  isXs = false;

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.setUpSidebar();
  }

  ngOnInit(): void {
    this.setUpSidebar();
  }

  setUpSidebar() {
    if (window.innerWidth <= 576) {
      this.isCollapsed = true;
      this.isXs = true;
    } else {
      this.isCollapsed = false;
      this.isXs = false;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  ticketSelected(ticket: TicketMock) {
    this.selectedTicket = ticket;
  }

  mockChats(): TicketMock[] {
    const mockChats: TicketMock[] = [];

    for (let i = 1; i <= 150; i++) {
      const ticket = {
        title: `Ticket №${i}`,
        messages: [] as MessageMock[],
      };

      const messageCount = Math.floor(Math.random() * 30) + 1; // Random number of messages (1 to 20)

      for (let j = 1; j <= messageCount; j++) {
        const messageMock: MessageMock = {
          author: Author.ME,
          message: `Message ${j} in Ticket ${i}`,
        };

        // Add some random long text for some messages
        if (Math.random() < 0.2) {
          messageMock.message += ' ' + this.generateRandomLongText();
        }

        if (Math.random() > 0.2 && Math.random() < 0.3) {
          messageMock.author = Author.SUPPORT;
        }

        ticket.messages.push(messageMock);
      }

      mockChats.push(ticket);
    }
    return mockChats;
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
