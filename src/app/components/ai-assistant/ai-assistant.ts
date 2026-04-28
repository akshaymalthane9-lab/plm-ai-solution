import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import { LocalAIEngine } from '../../services/local-ai.service';
import { UserService } from '../../services/user.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text: string;
  isActionable?: boolean;
  actionType?: 'delete' | 'draft_po' | 'update';
  actionPayload?: any;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-widget-container" [class.open]="isOpen">
      <button class="fab" (click)="toggleChat()">
        <span class="icon">✨</span>
      </button>

      <div class="chat-window card" *ngIf="isOpen">
        <div class="chat-header flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="header-icon">✨</div>
            <span class="title">Deloitte AI Copilot</span>
          </div>
          <button class="close-btn" (click)="toggleChat()">✕</button>
        </div>
        
        <div class="chat-body flex-col gap-4" #scrollMe>
          <!-- Welcome Message -->
          <div class="message-wrapper bot">
            <div class="avatar-sm bot-avatar">D</div>
            <div class="message-bubble bot-bubble">
              {{ getWelcomeMessage() }}
            </div>
          </div>

          <!-- Dynamic Messages -->
          <div *ngFor="let msg of messages" class="message-wrapper" [ngClass]="msg.role">
            <div class="avatar-sm bot-avatar" *ngIf="msg.role === 'bot'">D</div>
            
            <div class="message-bubble flex-col gap-2" [ngClass]="msg.role + '-bubble'">
              <div [innerHTML]="parseBold(msg.text)"></div>
              
              <!-- Action Card for Draft PO -->
              <div *ngIf="msg.isActionable && msg.actionType === 'draft_po'" class="action-card">
                <div class="font-medium text-sm">Action Required</div>
                <div class="text-xs text-muted mt-1">Pending approval for automated restock workflow.</div>
                <button class="btn btn-primary mt-2 text-xs" (click)="triggerAction(msg)">Approve Draft</button>
              </div>

              <!-- Action Card for Deletion -->
              <div *ngIf="msg.isActionable && msg.actionType === 'delete'" class="action-card" style="border-color: var(--color-danger)">
                <div class="font-medium text-sm text-danger" style="color:var(--color-danger)">⚠️ Confirm Deletion</div>
                <div class="text-xs text-muted mt-1">This will permanently remove SKU <strong class="font-mono">{{msg.actionPayload}}</strong> from the database.</div>
                <button class="btn btn-danger mt-2 text-xs" style="background: white; border: 1px solid var(--color-danger); color: var(--color-danger);" (click)="triggerAction(msg)">Permanently Delete</button>
              </div>

              <!-- Action Card for Update -->
              <div *ngIf="msg.isActionable && msg.actionType === 'update'" class="action-card" style="border-color: var(--accent-primary)">
                <div class="font-medium text-sm" style="color:var(--accent-primary)">✏️ Confirm Update</div>
                <div class="text-xs text-muted mt-1">This will update SKU <strong class="font-mono">{{msg.actionPayload?.sku}}</strong> to {{msg.actionPayload?.qty}} units.</div>
                <button class="btn btn-primary mt-2 text-xs" (click)="triggerAction(msg)">Execute Update</button>
              </div>
            </div>

            <div class="avatar-sm user-avatar" *ngIf="msg.role === 'user'">{{ getInitials() }}</div>
          </div>

          <!-- Typing Indicator -->
          <div class="message-wrapper bot" *ngIf="isTyping">
            <div class="avatar-sm bot-avatar">D</div>
            <div class="message-bubble bot-bubble typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>

        <div class="chat-footer">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="sendMessage()" 
            placeholder="Query Local NLP..." 
            class="chat-input" 
            [disabled]="isTyping"
          />
          <button class="send-btn" (click)="sendMessage()" [disabled]="!userInput.trim() || isTyping">➤</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .ai-widget-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 1000; }
    
    .fab {
      width: 56px; height: 56px; border-radius: 50%;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--accent-primary); font-size: 1.5rem;
      box-shadow: var(--shadow-float);
      cursor: pointer; transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      display: flex; align-items: center; justify-content: center;
    }
    .fab:hover { transform: scale(1.05); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
    .open .fab { display: none; }
    
    .chat-window {
      position: absolute; bottom: 0; right: 0; width: 380px; height: 560px;
      display: flex; flex-direction: column;
      box-shadow: var(--shadow-float); overflow: hidden; animation: slideUp 0.3s ease;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }
    
    .chat-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-surface);
      font-weight: 600;
      color: var(--text-primary);
    }
    .header-icon {
      background: var(--accent-primary-subtle);
      color: var(--accent-primary);
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
    }
    .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; }
    .close-btn:hover { color: var(--text-primary); }
    
    .chat-body { padding: 1.25rem; flex: 1; overflow-y: auto; background-color: var(--bg-app); font-size: 0.875rem; }
    
    .message-wrapper { display: flex; gap: 0.5rem; width: 100%; align-items: flex-end; margin-bottom: 1rem; }
    .user { justify-content: flex-end; }
    .bot { justify-content: flex-start; }
    
    .avatar-sm { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; flex-shrink: 0; }
    .bot-avatar { background-color: white; border: 1px solid var(--border-color); color: var(--accent-primary); }
    .user-avatar { background-color: var(--accent-primary); color: white; }
    
    .message-bubble { padding: 0.875rem; border-radius: 12px; max-width: 85%; box-shadow: 0 1px 2px rgba(0,0,0,0.05); line-height: 1.4; word-wrap: break-word;}
    .bot-bubble { background-color: var(--bg-surface); border: 1px solid var(--border-color); border-bottom-left-radius: 4px; color: var(--text-primary); }
    .user-bubble { background-color: var(--accent-primary-subtle); border: 1px solid rgba(240, 78, 35, 0.1); border-bottom-right-radius: 4px; color: var(--text-primary); }
    
    .action-card { background: var(--bg-app); padding: 0.75rem; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color); margin-top: 0.5rem; }
    .text-xs { font-size: 0.75rem; }
    .font-medium { font-weight: 500;}
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; padding: 0.3rem 0.6rem; }
    
    .chat-footer { padding: 1rem; border-top: 1px solid var(--border-color); background-color: var(--bg-surface); display: flex; gap: 0.5rem; align-items: center; }
    .chat-input { flex: 1; background: var(--bg-app); border: 1px solid var(--border-color); padding: 0.6rem 1rem; border-radius: 20px; color: var(--text-primary); outline: none; font-size: 0.875rem;}
    .chat-input:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 2px var(--accent-primary-subtle); }
    .chat-input:disabled { opacity: 0.6; }
    .send-btn { background: var(--accent-primary); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; padding-left:2px;}
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .typing-dots span { animation: blink 1.4s infinite both; font-size: 1.25rem; line-height: 0.5; margin: 0 1px; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `
})
export class AiAssistant implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  private cdr = inject(ChangeDetectorRef);
  private inventorySvc = inject(InventoryService);
  private artificialAiLayer = inject(LocalAIEngine);
  private userSvc = inject(UserService);

  isOpen = false;
  isTyping = false;
  userInput = '';
  
  messages: ChatMessage[] = [];
  messageCounter = 0;

  getWelcomeMessage() {
     const name = this.userSvc.currentUser() || 'User';
     return `Hello ${name}! My Local NLP Engine is wired to your live data. Try querying dynamic state like "total hardware stock" or "delete SVR-832".`;
  }

  getInitials() {
    const name = this.userSvc.currentUser() || 'U';
    return name.substring(0, 2).toUpperCase();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
      this.cdr.detectChanges();
    }
  }

  parseBold(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const query = this.userInput; // capture exact string

    this.messages = [...this.messages, {
      id: this.messageCounter++,
      role: 'user',
      text: query
    }];

    this.userInput = '';
    this.isTyping = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    setTimeout(() => {
      const rawData = this.inventorySvc.getData();
      let response = this.artificialAiLayer.process(query, rawData);

      // RBAC Security Gating interceptor
      if (response.isActionable && (response.actionType === 'delete' || response.actionType === 'update')) {
         if (this.userSvc.isReadOnly()) {
            response = {
              text: `WARNING: You requested a structural data mutation. However, your **Read-Only Assessor** security context explicitly denies destructive capabilities via Deloitte AI Copilot. Access denied.`,
              isActionable: false
            };
         }
      }

      this.messages = [...this.messages, {        id: this.messageCounter++,
        role: 'bot',
        text: response.text,
        isActionable: response.isActionable,
        actionType: response.actionType,
        actionPayload: response.actionPayload
      }];
      
      this.isTyping = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
    }, 1500);
  }

  triggerAction(msg: ChatMessage) {
    this.isTyping = true;
    
    // Perform Real Logic against State Machine
    if (msg.actionType === 'delete') {
       this.inventorySvc.deleteProduct(msg.actionPayload);
    } else if (msg.actionType === 'update') {
       this.inventorySvc.updateProductQty(msg.actionPayload.sku, msg.actionPayload.qty);
    }

    this.cdr.detectChanges();
    
    setTimeout(() => {
      let botResponse = 'Action executed successfully! Workflow initiated in internal bus.';
      if (msg.actionType === 'delete') {
         botResponse = `Item ${msg.actionPayload} completely purged from local storage map.`;
      } else if (msg.actionType === 'update') {
         botResponse = `Item ${msg.actionPayload.sku} successfully updated to ${msg.actionPayload.qty} units via local state machine.`;
      }

      this.messages = [...this.messages, {
        id: this.messageCounter++,
        role: 'bot',
        text: botResponse
      }];
      this.isTyping = false;
      this.cdr.detectChanges();
      this.scrollToBottom();
    }, 800);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
