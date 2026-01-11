import { type Edge } from '@xyflow/react';
import { type FlowNode } from '@/lib/nodes';

// =============================================================================
// Template Flow Types
// =============================================================================

export interface TemplateFlow {
  id: string;
  name: string;
  description: string;
  category: 'guardrails' | 'detection' | 'state-management' | 'quality';
  icon: string;
  nodes: FlowNode[];
  edges: Edge[];
}

// =============================================================================
// Template Flows for Common Bot Issues
// =============================================================================

export const TEMPLATE_FLOWS: TemplateFlow[] = [
  // =========================================================================
  // 1. Campaign Awareness - Buzzword Registry + Prompt Enrichment
  // =========================================================================
  {
    id: 'campaign-awareness',
    name: 'Campaign Awareness',
    description:
      'Detects campaign-related keywords and enriches prompts with current campaign context to prevent the bot from being unaware of active promotions.',
    category: 'guardrails',
    icon: 'Megaphone',
    nodes: [
      {
        id: 'campaign-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'Campaign Keyword Detector',
          keywords: 'promo, discount, offer, sale, campaign, deal, coupon, special',
          matchType: 'contains',
        },
      },
      {
        id: 'campaign-check',
        type: 'condition_branch',
        position: { x: 250, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Active Campaign Check',
          variable: '{{campaign.isActive}}',
          operator: 'equals',
          value: 'true',
        },
      },
      {
        id: 'campaign-enrich',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Enrich with Campaign Context',
          message:
            '[SYSTEM] Current active campaign: {{campaign.name}}. Details: {{campaign.details}}. Valid until: {{campaign.endDate}}. Promo code: {{campaign.code}}',
        },
      },
      {
        id: 'campaign-fallback',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'No Active Campaign Response',
          message:
            "I don't have information about any current promotions. Would you like me to notify you when we have new offers?",
        },
      },
    ],
    edges: [
      {
        id: 'e-campaign-1',
        source: 'campaign-trigger',
        sourceHandle: 'triggered',
        target: 'campaign-check',
        targetHandle: 'in',
      },
      {
        id: 'e-campaign-2',
        source: 'campaign-check',
        sourceHandle: 'true',
        target: 'campaign-enrich',
        targetHandle: 'in',
      },
      {
        id: 'e-campaign-3',
        source: 'campaign-check',
        sourceHandle: 'false',
        target: 'campaign-fallback',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 2. OOO Response Blocker - Regex Pattern Detection
  // =========================================================================
  {
    id: 'ooo-blocker',
    name: 'Out-of-Office Blocker',
    description:
      'Detects out-of-office auto-replies using regex patterns and blocks the bot from responding to prevent infinite reply loops.',
    category: 'detection',
    icon: 'ShieldOff',
    nodes: [
      {
        id: 'ooo-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'OOO Pattern Detector',
          keywords:
            'out of office|außer haus|abwesend|urlaub|vacation|auto-reply|automatische antwort|nicht im büro|currently away|be back on',
          matchType: 'regex',
        },
      },
      {
        id: 'ooo-check',
        type: 'condition_branch',
        position: { x: 250, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Confirm OOO Pattern',
          variable: '{{message}}',
          operator: 'contains',
          value: 'return|zurück|back|erreichbar',
        },
      },
      {
        id: 'ooo-block',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Block Response (Silent)',
          message:
            '[SYSTEM:BLOCK] OOO auto-reply detected. Conversation paused until user returns.',
        },
      },
      {
        id: 'ooo-continue',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Continue Normal Flow',
          message: '[SYSTEM:CONTINUE] Not an OOO message. Proceed with normal handling.',
        },
      },
    ],
    edges: [
      {
        id: 'e-ooo-1',
        source: 'ooo-trigger',
        sourceHandle: 'triggered',
        target: 'ooo-check',
        targetHandle: 'in',
      },
      {
        id: 'e-ooo-2',
        source: 'ooo-check',
        sourceHandle: 'true',
        target: 'ooo-block',
        targetHandle: 'in',
      },
      {
        id: 'e-ooo-3',
        source: 'ooo-check',
        sourceHandle: 'false',
        target: 'ooo-continue',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 3. Du/Sie Formality Guardrail - Auto-correction
  // =========================================================================
  {
    id: 'formality-guardrail',
    name: 'Formality Guardrail (Du/Sie)',
    description:
      'Detects formality mismatches in German conversations (du vs. Sie) and auto-corrects the output to maintain consistent tone.',
    category: 'guardrails',
    icon: 'Languages',
    nodes: [
      {
        id: 'formality-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'Incoming Message',
          keywords: '.*',
          matchType: 'regex',
        },
      },
      {
        id: 'formality-detect-user',
        type: 'condition_branch',
        position: { x: 250, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'User Uses Formal (Sie)',
          variable: '{{message}}',
          operator: 'contains',
          value: 'Sie|Ihnen|Ihr ',
        },
      },
      {
        id: 'formality-set-formal',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Set Formal Mode',
          message:
            '[SYSTEM:GUARDRAIL] User prefers formal address (Sie). Apply post-processing: Replace "du/dich/dir/dein" with "Sie/Ihnen/Ihr". Set {{user.formality}} = "formal"',
        },
      },
      {
        id: 'formality-set-informal',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Set Informal Mode',
          message:
            '[SYSTEM:GUARDRAIL] User prefers informal address (du). Apply post-processing: Replace "Sie/Ihnen/Ihr" with "du/dich/dir/dein". Set {{user.formality}} = "informal"',
        },
      },
    ],
    edges: [
      {
        id: 'e-formality-1',
        source: 'formality-trigger',
        sourceHandle: 'triggered',
        target: 'formality-detect-user',
        targetHandle: 'in',
      },
      {
        id: 'e-formality-2',
        source: 'formality-detect-user',
        sourceHandle: 'true',
        target: 'formality-set-formal',
        targetHandle: 'in',
      },
      {
        id: 'e-formality-3',
        source: 'formality-detect-user',
        sourceHandle: 'false',
        target: 'formality-set-informal',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 4. Message Length Limiter - Intelligent Truncation
  // =========================================================================
  {
    id: 'length-limiter',
    name: 'Message Length Limiter',
    description:
      'Enforces message length limits with intelligent truncation to prevent overwhelming users with long responses.',
    category: 'guardrails',
    icon: 'Scissors',
    nodes: [
      {
        id: 'length-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'Outgoing Message Check',
          keywords: '.*',
          matchType: 'regex',
        },
      },
      {
        id: 'length-check',
        type: 'condition_branch',
        position: { x: 250, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Exceeds 500 Characters',
          variable: '{{response.length}}',
          operator: 'greaterThan',
          value: '500',
        },
      },
      {
        id: 'length-truncate',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Truncate with Summary',
          message:
            '[SYSTEM:TRUNCATE] Response exceeds limit. Apply: 1) Find natural break point (sentence end) before 450 chars. 2) Append "... Soll ich mehr Details geben?" 3) Store full response in {{response.continuation}}',
        },
      },
      {
        id: 'length-pass',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Pass Through',
          message: '[SYSTEM:PASS] Response length OK. Send as-is.',
        },
      },
      {
        id: 'length-continue-check',
        type: 'condition_branch',
        position: { x: 100, y: 550 },
        data: {
          type: 'condition_branch',
          label: 'User Wants More',
          variable: '{{message}}',
          operator: 'contains',
          value: 'mehr|more|weiter|continue|ja|yes',
        },
      },
      {
        id: 'length-send-continuation',
        type: 'action_message',
        position: { x: 100, y: 720 },
        data: {
          type: 'action_message',
          label: 'Send Continuation',
          message: '{{response.continuation}}',
        },
      },
    ],
    edges: [
      {
        id: 'e-length-1',
        source: 'length-trigger',
        sourceHandle: 'triggered',
        target: 'length-check',
        targetHandle: 'in',
      },
      {
        id: 'e-length-2',
        source: 'length-check',
        sourceHandle: 'true',
        target: 'length-truncate',
        targetHandle: 'in',
      },
      {
        id: 'e-length-3',
        source: 'length-check',
        sourceHandle: 'false',
        target: 'length-pass',
        targetHandle: 'in',
      },
      {
        id: 'e-length-4',
        source: 'length-truncate',
        sourceHandle: 'sent',
        target: 'length-continue-check',
        targetHandle: 'in',
      },
      {
        id: 'e-length-5',
        source: 'length-continue-check',
        sourceHandle: 'true',
        target: 'length-send-continuation',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 5. Raffle/Game State Manager - Deferral System
  // =========================================================================
  {
    id: 'raffle-state-manager',
    name: 'Raffle State Manager',
    description:
      'Tracks raffle/game participation state and defers bot responses during active user participation to prevent interference.',
    category: 'state-management',
    icon: 'Trophy',
    nodes: [
      {
        id: 'raffle-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'Raffle Entry Detector',
          keywords: 'gewinnspiel|raffle|lottery|teilnehmen|participate|mitmachen|verlosung',
          matchType: 'contains',
        },
      },
      {
        id: 'raffle-state-check',
        type: 'condition_branch',
        position: { x: 250, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Raffle In Progress',
          variable: '{{user.raffleState}}',
          operator: 'equals',
          value: 'participating',
        },
      },
      {
        id: 'raffle-defer',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Defer Bot Response',
          message:
            '[SYSTEM:DEFER] User in active raffle. Queue message for later. Set {{bot.deferred}} = true. Resume after {{raffle.endTime}} or when {{user.raffleState}} = "completed"',
        },
      },
      {
        id: 'raffle-start',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Start Raffle Participation',
          message:
            '[SYSTEM:STATE] Set {{user.raffleState}} = "participating". Set {{raffle.startTime}} = now(). Pause normal bot interactions until completion.',
        },
      },
      {
        id: 'raffle-complete',
        type: 'trigger_keyword',
        position: { x: 400, y: 550 },
        data: {
          type: 'trigger_keyword',
          label: 'Raffle Completion Detector',
          keywords: 'danke|thank|submitted|eingereicht|fertig|done|complete',
          matchType: 'contains',
        },
      },
      {
        id: 'raffle-resume',
        type: 'action_message',
        position: { x: 400, y: 720 },
        data: {
          type: 'action_message',
          label: 'Resume Normal Operations',
          message:
            '[SYSTEM:RESUME] Set {{user.raffleState}} = "completed". Process deferred messages. Resume normal bot flow.',
        },
      },
    ],
    edges: [
      {
        id: 'e-raffle-1',
        source: 'raffle-trigger',
        sourceHandle: 'triggered',
        target: 'raffle-state-check',
        targetHandle: 'in',
      },
      {
        id: 'e-raffle-2',
        source: 'raffle-state-check',
        sourceHandle: 'true',
        target: 'raffle-defer',
        targetHandle: 'in',
      },
      {
        id: 'e-raffle-3',
        source: 'raffle-state-check',
        sourceHandle: 'false',
        target: 'raffle-start',
        targetHandle: 'in',
      },
      {
        id: 'e-raffle-4',
        source: 'raffle-start',
        sourceHandle: 'sent',
        target: 'raffle-complete',
        targetHandle: 'in',
      },
      {
        id: 'e-raffle-5',
        source: 'raffle-complete',
        sourceHandle: 'triggered',
        target: 'raffle-resume',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 6. Agent Conflict Blocker - Conversation State Management
  // =========================================================================
  {
    id: 'agent-conflict-blocker',
    name: 'Agent Conflict Blocker',
    description:
      'Detects when a human agent is active in a conversation and blocks bot responses to prevent conflicts and confusion.',
    category: 'state-management',
    icon: 'UserX',
    nodes: [
      {
        id: 'agent-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'Incoming Message',
          keywords: '.*',
          matchType: 'regex',
        },
      },
      {
        id: 'agent-check',
        type: 'condition_branch',
        position: { x: 250, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Human Agent Active',
          variable: '{{conversation.agentActive}}',
          operator: 'equals',
          value: 'true',
        },
      },
      {
        id: 'agent-block',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Block Bot Response',
          message:
            '[SYSTEM:BLOCK] Human agent active. Bot response suppressed. Monitor for {{conversation.agentActive}} = false to resume.',
        },
      },
      {
        id: 'agent-timeout-check',
        type: 'condition_branch',
        position: { x: 100, y: 550 },
        data: {
          type: 'condition_branch',
          label: 'Agent Timeout (15 min)',
          variable: '{{conversation.agentLastActivity}}',
          operator: 'greaterThan',
          value: '900000',
        },
      },
      {
        id: 'agent-auto-resume',
        type: 'action_message',
        position: { x: 100, y: 720 },
        data: {
          type: 'action_message',
          label: 'Auto-Resume Bot',
          message:
            '[SYSTEM:RESUME] Agent timeout reached. Set {{conversation.agentActive}} = false. Bot resuming conversation.',
        },
      },
      {
        id: 'agent-continue',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Process with Bot',
          message: '[SYSTEM:CONTINUE] No human agent active. Proceed with bot response.',
        },
      },
      {
        id: 'agent-handoff-detect',
        type: 'trigger_keyword',
        position: { x: 550, y: 200 },
        data: {
          type: 'trigger_keyword',
          label: 'Agent Handoff Detector',
          keywords: 'agent|mitarbeiter|support|human|mensch|transfer',
          matchType: 'contains',
        },
      },
      {
        id: 'agent-activate',
        type: 'action_message',
        position: { x: 550, y: 380 },
        data: {
          type: 'action_message',
          label: 'Activate Agent Mode',
          message:
            '[SYSTEM:HANDOFF] Set {{conversation.agentActive}} = true. Set {{conversation.agentLastActivity}} = now(). Notify agent queue.',
        },
      },
    ],
    edges: [
      {
        id: 'e-agent-1',
        source: 'agent-trigger',
        sourceHandle: 'triggered',
        target: 'agent-check',
        targetHandle: 'in',
      },
      {
        id: 'e-agent-2',
        source: 'agent-check',
        sourceHandle: 'true',
        target: 'agent-block',
        targetHandle: 'in',
      },
      {
        id: 'e-agent-3',
        source: 'agent-check',
        sourceHandle: 'false',
        target: 'agent-continue',
        targetHandle: 'in',
      },
      {
        id: 'e-agent-4',
        source: 'agent-block',
        sourceHandle: 'sent',
        target: 'agent-timeout-check',
        targetHandle: 'in',
      },
      {
        id: 'e-agent-5',
        source: 'agent-timeout-check',
        sourceHandle: 'true',
        target: 'agent-auto-resume',
        targetHandle: 'in',
      },
      {
        id: 'e-agent-6',
        source: 'agent-handoff-detect',
        sourceHandle: 'triggered',
        target: 'agent-activate',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 7. Repetitive Question Eliminator - Info Extraction
  // =========================================================================
  {
    id: 'repetitive-question-eliminator',
    name: 'Repetitive Question Eliminator',
    description:
      'Extracts and stores user information to prevent asking the same questions repeatedly. Removes redundant questions from bot responses.',
    category: 'quality',
    icon: 'ListChecks',
    nodes: [
      {
        id: 'repeat-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'User Response',
          keywords: '.*',
          matchType: 'regex',
        },
      },
      {
        id: 'repeat-extract-name',
        type: 'condition_branch',
        position: { x: 100, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Name Provided',
          variable: '{{message}}',
          operator: 'contains',
          value: 'ich bin|mein name|i am|my name|heiße|call me',
        },
      },
      {
        id: 'repeat-store-name',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Store Name',
          message:
            '[SYSTEM:EXTRACT] Extract name from message. Set {{user.name}} = extracted. Add "name" to {{user.knownFields}}. Remove name questions from future prompts.',
        },
      },
      {
        id: 'repeat-extract-email',
        type: 'condition_branch',
        position: { x: 400, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Email Provided',
          variable: '{{message}}',
          operator: 'contains',
          value: '@',
        },
      },
      {
        id: 'repeat-store-email',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Store Email',
          message:
            '[SYSTEM:EXTRACT] Extract email via regex. Set {{user.email}} = extracted. Add "email" to {{user.knownFields}}. Remove email questions from future prompts.',
        },
      },
      {
        id: 'repeat-filter-output',
        type: 'action_message',
        position: { x: 250, y: 550 },
        data: {
          type: 'action_message',
          label: 'Filter Bot Output',
          message:
            '[SYSTEM:FILTER] Before sending response: For each field in {{user.knownFields}}, remove questions asking for that field. Apply regex removal for: "wie heißen sie|what is your name|your email|ihre email"',
        },
      },
    ],
    edges: [
      {
        id: 'e-repeat-1',
        source: 'repeat-trigger',
        sourceHandle: 'triggered',
        target: 'repeat-extract-name',
        targetHandle: 'in',
      },
      {
        id: 'e-repeat-2',
        source: 'repeat-trigger',
        sourceHandle: 'triggered',
        target: 'repeat-extract-email',
        targetHandle: 'in',
      },
      {
        id: 'e-repeat-3',
        source: 'repeat-extract-name',
        sourceHandle: 'true',
        target: 'repeat-store-name',
        targetHandle: 'in',
      },
      {
        id: 'e-repeat-4',
        source: 'repeat-extract-email',
        sourceHandle: 'true',
        target: 'repeat-store-email',
        targetHandle: 'in',
      },
      {
        id: 'e-repeat-5',
        source: 'repeat-store-name',
        sourceHandle: 'sent',
        target: 'repeat-filter-output',
        targetHandle: 'in',
      },
      {
        id: 'e-repeat-6',
        source: 'repeat-store-email',
        sourceHandle: 'sent',
        target: 'repeat-filter-output',
        targetHandle: 'in',
      },
    ],
  },

  // =========================================================================
  // 8. Fabrication Detector - Pattern Detection + Review Flagging
  // =========================================================================
  {
    id: 'fabrication-detector',
    name: 'Fabrication Detector',
    description:
      'Detects potential AI hallucinations/fabrications using pattern matching and flags responses for human review.',
    category: 'quality',
    icon: 'AlertTriangle',
    nodes: [
      {
        id: 'fab-trigger',
        type: 'trigger_keyword',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger_keyword',
          label: 'Bot Response Check',
          keywords: '.*',
          matchType: 'regex',
        },
      },
      {
        id: 'fab-check-uncertainty',
        type: 'condition_branch',
        position: { x: 100, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Contains Uncertainty Markers',
          variable: '{{response}}',
          operator: 'contains',
          value:
            'ich glaube|i think|probably|wahrscheinlich|might be|könnte sein|not sure|nicht sicher',
        },
      },
      {
        id: 'fab-check-specifics',
        type: 'condition_branch',
        position: { x: 400, y: 200 },
        data: {
          type: 'condition_branch',
          label: 'Contains Specific Claims',
          variable: '{{response}}',
          operator: 'contains',
          value: '\\d{4}|€\\d|\\$\\d|%|telefon|phone|address|adresse|price|preis',
        },
      },
      {
        id: 'fab-flag-review',
        type: 'action_message',
        position: { x: 100, y: 380 },
        data: {
          type: 'action_message',
          label: 'Flag for Review (Low Confidence)',
          message:
            '[SYSTEM:FLAG] Uncertainty detected in response. Confidence: LOW. Add to review queue. Consider adding disclaimer: "Bitte überprüfen Sie diese Information."',
        },
      },
      {
        id: 'fab-verify-facts',
        type: 'action_message',
        position: { x: 400, y: 380 },
        data: {
          type: 'action_message',
          label: 'Verify Against Knowledge Base',
          message:
            '[SYSTEM:VERIFY] Specific claim detected. Cross-reference with {{knowledgeBase}}. If not found, flag as potential fabrication. Set {{response.verified}} = false.',
        },
      },
      {
        id: 'fab-check-verified',
        type: 'condition_branch',
        position: { x: 400, y: 550 },
        data: {
          type: 'condition_branch',
          label: 'Verified in KB',
          variable: '{{response.verified}}',
          operator: 'equals',
          value: 'true',
        },
      },
      {
        id: 'fab-send-verified',
        type: 'action_message',
        position: { x: 250, y: 720 },
        data: {
          type: 'action_message',
          label: 'Send Verified Response',
          message: '[SYSTEM:SEND] Response verified. Send to user.',
        },
      },
      {
        id: 'fab-flag-fabrication',
        type: 'action_message',
        position: { x: 550, y: 720 },
        data: {
          type: 'action_message',
          label: 'Flag Potential Fabrication',
          message:
            '[SYSTEM:FABRICATION] Unverified specific claim detected. Options: 1) Block response 2) Add disclaimer 3) Route to human review. Log for analysis.',
        },
      },
    ],
    edges: [
      {
        id: 'e-fab-1',
        source: 'fab-trigger',
        sourceHandle: 'triggered',
        target: 'fab-check-uncertainty',
        targetHandle: 'in',
      },
      {
        id: 'e-fab-2',
        source: 'fab-trigger',
        sourceHandle: 'triggered',
        target: 'fab-check-specifics',
        targetHandle: 'in',
      },
      {
        id: 'e-fab-3',
        source: 'fab-check-uncertainty',
        sourceHandle: 'true',
        target: 'fab-flag-review',
        targetHandle: 'in',
      },
      {
        id: 'e-fab-4',
        source: 'fab-check-specifics',
        sourceHandle: 'true',
        target: 'fab-verify-facts',
        targetHandle: 'in',
      },
      {
        id: 'e-fab-5',
        source: 'fab-verify-facts',
        sourceHandle: 'sent',
        target: 'fab-check-verified',
        targetHandle: 'in',
      },
      {
        id: 'e-fab-6',
        source: 'fab-check-verified',
        sourceHandle: 'true',
        target: 'fab-send-verified',
        targetHandle: 'in',
      },
      {
        id: 'e-fab-7',
        source: 'fab-check-verified',
        sourceHandle: 'false',
        target: 'fab-flag-fabrication',
        targetHandle: 'in',
      },
    ],
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all template flows
 */
export function getAllTemplateFlows(): TemplateFlow[] {
  return TEMPLATE_FLOWS;
}

/**
 * Get template flows by category
 */
export function getTemplateFlowsByCategory(category: TemplateFlow['category']): TemplateFlow[] {
  return TEMPLATE_FLOWS.filter((flow) => flow.category === category);
}

/**
 * Get a template flow by ID
 */
export function getTemplateFlowById(id: string): TemplateFlow | undefined {
  return TEMPLATE_FLOWS.find((flow) => flow.id === id);
}

/**
 * Get all template flow categories
 */
export function getTemplateFlowCategories(): TemplateFlow['category'][] {
  return ['guardrails', 'detection', 'state-management', 'quality'];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: TemplateFlow['category']): string {
  const names: Record<TemplateFlow['category'], string> = {
    guardrails: 'Guardrails',
    detection: 'Detection',
    'state-management': 'State Management',
    quality: 'Quality Assurance',
  };
  return names[category];
}
