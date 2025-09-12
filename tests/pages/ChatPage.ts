import { Page, expect } from '@playwright/test';

export class ChatPage {
  constructor(private page: Page) {}

  // Locators
  private readonly businessToolsButton = this.page.getByRole('button', { name: 'Open business tools' });
  private readonly voiceAIOption = this.page.getByRole('menuitem', { name: 'Voice AI Natural conversation' });
  private readonly startRecordingButton = this.page.getByRole('button', { name: 'Start recording' });
  private readonly videoCallOption = this.page.getByRole('menuitem', { name: 'Video Call Face-to-face' });
  private readonly screenShareOption = this.page.getByRole('menuitem', { name: 'Screen Share Business process' });
  private readonly businessInput = this.page.getByRole('textbox', { name: 'Business inquiry input' });
  private readonly sendButton = this.page.getByRole('button', { name: 'Send message' });
  private readonly settingsButton = this.page.getByRole('button', { name: 'Settings' });
  private readonly stageProgress = this.page.getByRole('button', { name: /Stage \d+\/\d+ • \d+% Complete/ });

  // Actions
  async navigate() {
    await this.page.goto('http://localhost:3000/chat');
    await this.page.waitForLoadState('networkidle');
  }

  async startVoiceAI() {
    await this.businessToolsButton.click();
    await this.voiceAIOption.click();
    await this.startRecordingButton.click();
  }

  async startVideoCall() {
    await this.businessToolsButton.click();
    await this.videoCallOption.click();
  }

  async startScreenShare() {
    await this.businessToolsButton.click();
    await this.screenShareOption.click();
  }

  async sendMessage(message: string) {
    await this.businessInput.fill(message);
    await this.sendButton.click();
  }

  async openSettings() {
    await this.settingsButton.click();
  }

  // Assertions
  async verifyStageProgress(stage: number, totalStages: number, percentage: number) {
    const expectedText = `Stage ${stage}/${totalStages} • ${percentage}% Complete`;
    await expect(this.stageProgress).toHaveText(expectedText);
  }

  async verifyMessageSent(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}
