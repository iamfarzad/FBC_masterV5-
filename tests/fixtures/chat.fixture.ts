import { test as base } from '@playwright/test';
import { ChatPage } from '../pages/ChatPage';

type Fixtures = {
  chatPage: ChatPage;
};

export const test = base.extend<Fixtures>({
  chatPage: async ({ page }, use) => {
    const chatPage = new ChatPage(page);
    await chatPage.navigate();
    await use(chatPage);
  },
});

export { expect } from '@playwright/test';
