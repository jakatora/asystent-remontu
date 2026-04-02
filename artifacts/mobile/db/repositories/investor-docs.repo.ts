import type {
  OfficialFormRecord,
  OfficialFormStatus,
  ApplicabilityState,
  InvestorDocRecord,
  InvestorDocGroup,
  InvestorDocStatus,
  BuildDecisionRecord,
  DecisionCategory,
  DecisionStatus,
  BuildQuestionRecord,
  QuestionPriority,
  CompletionPackageItem,
} from '@/types/house-build';
import { getDb } from '@/db/client';

function generateId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface OfficialFormRow {
  id: string; project_id: string; form_key: string; title: string; explanation: string;
  process_phase: string; applicability: string; status: string; planned_date: string | null;
  completed_date: string | null; notes: string; official_link: string; created_at: string; updated_at: string;
}

interface InvestorDocRow {
  id: string; project_id: string; doc_group: string; title: string; description: string;
  status: string; stage_key: string | null; file_ref: string | null; notes: string;
  created_at: string; updated_at: string;
}

interface DecisionRow {
  id: string; project_id: string; title: string; category: string; stage_key: string | null;
  status: string; options_considered: string; selected_option: string; reasoning: string;
  decision_date: string | null; follow_up_questions: string; warning_note: string;
  created_at: string; updated_at: string;
}

interface QuestionRow {
  id: string; project_id: string; question_text: string; stage_key: string | null;
  target_role: string; priority: string; is_answered: number; answer_text: string;
  follow_up_needed: number; linked_decision_id: string | null; created_at: string; updated_at: string;
}

interface CompletionItemRow {
  id: string; project_id: string; item_key: string; title: string;
  applicability: string; status: string; notes: string; created_at: string;
}

function formFromRow(r: OfficialFormRow): OfficialFormRecord {
  return {
    id: r.id, projectId: r.project_id, formKey: r.form_key, title: r.title,
    explanation: r.explanation, processPhase: r.process_phase,
    applicability: r.applicability as ApplicabilityState, status: r.status as OfficialFormStatus,
    plannedDate: r.planned_date, completedDate: r.completed_date, notes: r.notes,
    officialLink: r.official_link, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function docFromRow(r: InvestorDocRow): InvestorDocRecord {
  return {
    id: r.id, projectId: r.project_id, group: r.doc_group as InvestorDocGroup,
    title: r.title, description: r.description, status: r.status as InvestorDocStatus,
    stageKey: r.stage_key, fileRef: r.file_ref, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function decisionFromRow(r: DecisionRow): BuildDecisionRecord {
  return {
    id: r.id, projectId: r.project_id, title: r.title,
    category: r.category as DecisionCategory, stageKey: r.stage_key,
    status: r.status as DecisionStatus, optionsConsidered: r.options_considered,
    selectedOption: r.selected_option, reasoning: r.reasoning,
    decisionDate: r.decision_date, followUpQuestions: r.follow_up_questions,
    warningNote: r.warning_note, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function questionFromRow(r: QuestionRow): BuildQuestionRecord {
  return {
    id: r.id, projectId: r.project_id, questionText: r.question_text,
    stageKey: r.stage_key, targetRole: r.target_role, priority: r.priority as QuestionPriority,
    isAnswered: r.is_answered === 1, answerText: r.answer_text,
    followUpNeeded: r.follow_up_needed === 1, linkedDecisionId: r.linked_decision_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function completionFromRow(r: CompletionItemRow): CompletionPackageItem {
  return {
    id: r.id, projectId: r.project_id, itemKey: r.item_key, title: r.title,
    applicability: r.applicability as ApplicabilityState,
    status: r.status as InvestorDocStatus, notes: r.notes, createdAt: r.created_at,
  };
}

export const investorDocsRepo = {
  async getOfficialForms(projectId: string): Promise<OfficialFormRecord[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<OfficialFormRow>(
      'SELECT * FROM build_official_forms WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(formFromRow);
  },

  async upsertOfficialForm(projectId: string, formKey: string, data: {
    title?: string; explanation?: string; processPhase?: string;
    applicability?: ApplicabilityState; status?: OfficialFormStatus;
    plannedDate?: string | null; completedDate?: string | null;
    notes?: string; officialLink?: string;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<OfficialFormRow>(
      'SELECT * FROM build_official_forms WHERE project_id = ? AND form_key = ?',
      [projectId, formKey]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | null)[] = [];
      if (data.title !== undefined) { sets.push('title = ?'); values.push(data.title); }
      if (data.explanation !== undefined) { sets.push('explanation = ?'); values.push(data.explanation); }
      if (data.processPhase !== undefined) { sets.push('process_phase = ?'); values.push(data.processPhase); }
      if (data.applicability !== undefined) { sets.push('applicability = ?'); values.push(data.applicability); }
      if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
      if (data.plannedDate !== undefined) { sets.push('planned_date = ?'); values.push(data.plannedDate); }
      if (data.completedDate !== undefined) { sets.push('completed_date = ?'); values.push(data.completedDate); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      if (data.officialLink !== undefined) { sets.push('official_link = ?'); values.push(data.officialLink); }
      sets.push('updated_at = ?'); values.push(now);
      values.push(existing.id);
      await db.runAsync(`UPDATE build_official_forms SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bof');
    await db.runAsync(
      `INSERT INTO build_official_forms (id, project_id, form_key, title, explanation, process_phase, applicability, status, planned_date, completed_date, notes, official_link, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, formKey, data.title ?? formKey, data.explanation ?? '', data.processPhase ?? '', data.applicability ?? 'unknown', data.status ?? 'not-started', data.plannedDate ?? null, data.completedDate ?? null, data.notes ?? '', data.officialLink ?? '', now, now]
    );
    return id;
  },

  async getInvestorDocs(projectId: string, group?: InvestorDocGroup): Promise<InvestorDocRecord[]> {
    const db = await getDb();
    if (group) {
      const rows = await db.getAllAsync<InvestorDocRow>(
        'SELECT * FROM build_investor_docs WHERE project_id = ? AND doc_group = ? ORDER BY created_at',
        [projectId, group]
      );
      return rows.map(docFromRow);
    }
    const rows = await db.getAllAsync<InvestorDocRow>(
      'SELECT * FROM build_investor_docs WHERE project_id = ? ORDER BY doc_group, created_at',
      [projectId]
    );
    return rows.map(docFromRow);
  },

  async addInvestorDoc(projectId: string, data: {
    group: InvestorDocGroup; title: string; description?: string;
    stageKey?: string | null; notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bid');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_investor_docs (id, project_id, doc_group, title, description, status, stage_key, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'missing', ?, ?, ?, ?)`,
      [id, projectId, data.group, data.title, data.description ?? '', data.stageKey ?? null, data.notes ?? '', now, now]
    );
    return id;
  },

  async updateInvestorDoc(id: string, data: {
    status?: InvestorDocStatus; notes?: string; fileRef?: string | null;
  }): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (string | null)[] = [];
    if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
    if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
    if (data.fileRef !== undefined) { sets.push('file_ref = ?'); values.push(data.fileRef); }
    if (sets.length === 0) return;
    sets.push('updated_at = ?'); values.push(new Date().toISOString());
    values.push(id);
    await db.runAsync(`UPDATE build_investor_docs SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async deleteInvestorDoc(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_investor_docs WHERE id = ?', [id]);
  },

  async getDecisions(projectId: string): Promise<BuildDecisionRecord[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<DecisionRow>(
      'SELECT * FROM build_decisions WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(decisionFromRow);
  },

  async addDecision(projectId: string, data: {
    title: string; category?: DecisionCategory; stageKey?: string | null;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bdd');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_decisions (id, project_id, title, category, stage_key, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'open', ?, ?)`,
      [id, projectId, data.title, data.category ?? 'other', data.stageKey ?? null, now, now]
    );
    return id;
  },

  async updateDecision(id: string, data: {
    title?: string; category?: DecisionCategory; status?: DecisionStatus;
    optionsConsidered?: string; selectedOption?: string; reasoning?: string;
    decisionDate?: string | null; followUpQuestions?: string; warningNote?: string;
  }): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (string | null)[] = [];
    if (data.title !== undefined) { sets.push('title = ?'); values.push(data.title); }
    if (data.category !== undefined) { sets.push('category = ?'); values.push(data.category); }
    if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
    if (data.optionsConsidered !== undefined) { sets.push('options_considered = ?'); values.push(data.optionsConsidered); }
    if (data.selectedOption !== undefined) { sets.push('selected_option = ?'); values.push(data.selectedOption); }
    if (data.reasoning !== undefined) { sets.push('reasoning = ?'); values.push(data.reasoning); }
    if (data.decisionDate !== undefined) { sets.push('decision_date = ?'); values.push(data.decisionDate); }
    if (data.followUpQuestions !== undefined) { sets.push('follow_up_questions = ?'); values.push(data.followUpQuestions); }
    if (data.warningNote !== undefined) { sets.push('warning_note = ?'); values.push(data.warningNote); }
    if (sets.length === 0) return;
    sets.push('updated_at = ?'); values.push(new Date().toISOString());
    values.push(id);
    await db.runAsync(`UPDATE build_decisions SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async deleteDecision(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_decisions WHERE id = ?', [id]);
  },

  async getQuestions(projectId: string, stageKey?: string): Promise<BuildQuestionRecord[]> {
    const db = await getDb();
    if (stageKey) {
      const rows = await db.getAllAsync<QuestionRow>(
        'SELECT * FROM build_questions WHERE project_id = ? AND stage_key = ? ORDER BY created_at',
        [projectId, stageKey]
      );
      return rows.map(questionFromRow);
    }
    const rows = await db.getAllAsync<QuestionRow>(
      'SELECT * FROM build_questions WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(questionFromRow);
  },

  async addQuestion(projectId: string, data: {
    questionText: string; stageKey?: string | null;
    targetRole?: string; priority?: QuestionPriority;
  }): Promise<string> {
    const db = await getDb();
    const id = generateId('bqt');
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO build_questions (id, project_id, question_text, stage_key, target_role, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, data.questionText, data.stageKey ?? null, data.targetRole ?? '', data.priority ?? 'normal', now, now]
    );
    return id;
  },

  async updateQuestion(id: string, data: {
    isAnswered?: boolean; answerText?: string; followUpNeeded?: boolean;
    priority?: QuestionPriority;
  }): Promise<void> {
    const db = await getDb();
    const sets: string[] = [];
    const values: (string | number | null)[] = [];
    if (data.isAnswered !== undefined) { sets.push('is_answered = ?'); values.push(data.isAnswered ? 1 : 0); }
    if (data.answerText !== undefined) { sets.push('answer_text = ?'); values.push(data.answerText); }
    if (data.followUpNeeded !== undefined) { sets.push('follow_up_needed = ?'); values.push(data.followUpNeeded ? 1 : 0); }
    if (data.priority !== undefined) { sets.push('priority = ?'); values.push(data.priority); }
    if (sets.length === 0) return;
    sets.push('updated_at = ?'); values.push(new Date().toISOString());
    values.push(id);
    await db.runAsync(`UPDATE build_questions SET ${sets.join(', ')} WHERE id = ?`, values);
  },

  async deleteQuestion(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_questions WHERE id = ?', [id]);
  },

  async getCompletionItems(projectId: string): Promise<CompletionPackageItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<CompletionItemRow>(
      'SELECT * FROM build_completion_items WHERE project_id = ? ORDER BY created_at',
      [projectId]
    );
    return rows.map(completionFromRow);
  },

  async upsertCompletionItem(projectId: string, itemKey: string, data: {
    title?: string; applicability?: ApplicabilityState;
    status?: InvestorDocStatus; notes?: string;
  }): Promise<string> {
    const db = await getDb();
    const existing = await db.getFirstAsync<CompletionItemRow>(
      'SELECT * FROM build_completion_items WHERE project_id = ? AND item_key = ?',
      [projectId, itemKey]
    );
    const now = new Date().toISOString();
    if (existing) {
      const sets: string[] = [];
      const values: (string | null)[] = [];
      if (data.title !== undefined) { sets.push('title = ?'); values.push(data.title); }
      if (data.applicability !== undefined) { sets.push('applicability = ?'); values.push(data.applicability); }
      if (data.status !== undefined) { sets.push('status = ?'); values.push(data.status); }
      if (data.notes !== undefined) { sets.push('notes = ?'); values.push(data.notes); }
      if (sets.length === 0) return existing.id;
      values.push(existing.id);
      await db.runAsync(`UPDATE build_completion_items SET ${sets.join(', ')} WHERE id = ?`, values);
      return existing.id;
    }
    const id = generateId('bci');
    await db.runAsync(
      `INSERT INTO build_completion_items (id, project_id, item_key, title, applicability, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, projectId, itemKey, data.title ?? itemKey, data.applicability ?? 'unknown', data.status ?? 'missing', data.notes ?? '', now]
    );
    return id;
  },

  async deleteProjectData(projectId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM build_official_forms WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_investor_docs WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_decisions WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_questions WHERE project_id = ?', [projectId]);
    await db.runAsync('DELETE FROM build_completion_items WHERE project_id = ?', [projectId]);
  },
};
