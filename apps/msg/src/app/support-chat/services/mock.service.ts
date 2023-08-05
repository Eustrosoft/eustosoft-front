import { Injectable } from '@angular/core';
import { User } from '../interfaces/user.interface';

@Injectable()
export class MockService {
  getRandomUsers(users: User[], count: number): User[] {
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

  getRandomDate(): string {
    const startTimestamp = new Date(2023, 0, 1).getTime(); // January 1, 2023
    const endTimestamp = new Date().getTime(); // Current date
    const randomTimestamp =
      Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
    const randomDate = new Date(randomTimestamp);
    return randomDate.toISOString().slice(0, 10); // Get the date in 'YYYY-MM-DD' format
  }

  getRandomDateTime(): string {
    const startTimestamp = new Date(2023, 0, 1).getTime(); // January 1, 2023
    const endTimestamp = new Date().getTime(); // Current date
    const randomTimestamp =
      Math.random() * (endTimestamp - startTimestamp) + startTimestamp;
    const randomDate = new Date(randomTimestamp);
    return randomDate.toISOString(); // Get the date and time in 'YYYY-MM-DDTHH:mm:ssZ' format
  }

  getRandomBoolean(): boolean {
    return Math.random() < 0.5; // Randomly return true or false
  }

  generateMockUser(userId: number): User {
    return {
      id: userId,
      name: `User ${userId}`,
    };
  }

  generateMockUsers(count: number): User[] {
    const users: User[] = [];
    // Generate 10 users
    for (let userId = 1; userId <= count; userId++) {
      const user = this.generateMockUser(userId);
      users.push(user);
    }
    return users;
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
