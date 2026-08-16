/**
 * Local plan-review helpers (copied contract; avoid cross-plugin value imports).
 */
export function planReviewOf(questions) {
    if (questions.length !== 1)
        return undefined;
    const question = questions[0];
    const intent = question.intent;
    if (intent?.kind !== 'plan-review' || question.detail === undefined)
        return undefined;
    if (question.multiSelect === true)
        return undefined;
    const options = question.options ?? [];
    if (options.length > 2)
        return undefined;
    const approve = options.find(option => option.label === intent.approve);
    if (approve === undefined)
        return undefined;
    const decline = options.find(option => option.label !== intent.approve);
    return {
        id: question.id,
        question: question.question,
        plan: question.detail,
        approve,
        ...decline === undefined ? {} : { decline },
    };
}
export class PendingQuestion {
    wait;
    constructor(wait) {
        this.wait = wait;
    }
    get key() {
        return this.wait.key;
    }
    get questions() {
        return this.wait.payload.questions;
    }
    get sessionId() {
        return this.wait.sessionId;
    }
    async answer(answer) {
        const receipt = await this.wait.respond({
            ok: true, value: { sessionId: this.wait.sessionId, answer },
        });
        if (!receipt.accepted) {
            throw new Error(`question response rejected: ${receipt.reason}`);
        }
    }
    async cancel() {
        const receipt = await this.wait.respond({
            ok: false,
            error: { code: 'cancelled', message: 'the user closed this question request', details: {} },
        });
        if (!receipt.accepted) {
            throw new Error(`question cancellation rejected: ${receipt.reason}`);
        }
    }
}
