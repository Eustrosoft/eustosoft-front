import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
} from '@angular/core';
import { Author, MessageMock, TicketMock } from './ticket-mocks.interface';
import { FormControl } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'eustrosoft-front-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportChatComponent implements AfterViewInit {
  @ViewChild('messagesVirtualScrollViewport')
  messagesVirtualScrollViewport!: CdkVirtualScrollViewport;

  tickets = this.mockChats();
  selectedTicket: TicketMock = this.tickets[0];
  control = new FormControl('', {
    nonNullable: true,
  });
  msgAuthor = Author;

  ngAfterViewInit(): void {
    this.messagesVirtualScrollViewport.scrollToIndex(
      this.tickets[0].messages.length - 1
    );
  }

  ticketSelected(ticket: TicketMock) {
    this.selectedTicket = ticket;
    this.messagesVirtualScrollViewport.scrollToIndex(
      ticket.messages.length - 1
    );
    // const items = document.getElementsByClassName('list-message-item');
    // items[items.length - 1].scrollIntoView();
    setTimeout(() => {
      const items = document.getElementsByClassName('list-message-item');
      items[items.length - 1].scrollIntoView();
    }, 10);
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
