/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { __awaiter } from "tslib";
import { expect } from 'chai';
import { Given, When, Then, Before, After } from 'cucumber';
import { EditorMap, CatalogMap, MockLogger, MockEditorRepo, MockCatalogRepo, } from '@hindawi/shared';
import { JournalEditorRemovedHandler } from '../../src/queue_service/handlers/JournalEditorRemoved';
function getRandom(arr, n) {
    const result = new Array(n);
    let len = arr.length;
    const taken = new Array(len);
    if (n > len) {
        throw new RangeError('getRandom: more elements taken than available');
    }
    while (n--) {
        const x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
const { handler } = JournalEditorRemovedHandler;
let mockLogger;
let mockEditorRepo;
let mockCatalogRepo;
let context = {};
let eventData = null;
let journalId = null;
let journalEditors = [];
Before(function () {
    mockLogger = new MockLogger();
    mockEditorRepo = new MockEditorRepo();
    mockCatalogRepo = new MockCatalogRepo();
    context = {
        repos: {
            editor: mockEditorRepo,
            catalog: mockCatalogRepo,
        },
        services: {
            logger: mockLogger,
        },
    };
});
After(function () {
    journalEditors = [];
});
Given(/^There are (\d+) editors in the Journal "([\w-]+)"$/, function (editorsLength, testJournalId) {
    return __awaiter(this, void 0, void 0, function* () {
        journalId = testJournalId;
        yield mockCatalogRepo.save(CatalogMap.toDomain({
            journalId,
            type: 'mock',
            amount: 666,
        }));
        yield Promise.all([...new Array(+editorsLength)].map((curr, idx) => __awaiter(this, void 0, void 0, function* () {
            const rawEditor = {
                editorId: `${testJournalId}-${idx}-editor`,
                journalId: `${testJournalId}`,
                name: `${idx}-editor-name`,
                email: `email${idx}@editor.com`,
                roleType: `${idx}-role-type`,
                roleLabel: `${idx}-role-label`,
            };
            const editor = EditorMap.toDomain(rawEditor);
            yield mockEditorRepo.save(editor);
            journalEditors.push(editor);
        })));
    });
});
Given(/^All editors list from event data contains (\d+) entries only$/, (eventEditorsLength) => __awaiter(void 0, void 0, void 0, function* () {
    const eventEditors = getRandom(journalEditors, +eventEditorsLength);
    eventData = {
        editors: eventEditors.map(EditorMap.toPersistence),
    };
}));
Given(/^The journal id from event data is "([\w-]+)"$/, (eventJournalId) => __awaiter(void 0, void 0, void 0, function* () {
    eventData.id = eventJournalId;
}));
When('"JournalEditorRemoved" event is being published', function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield handler.call(context, eventData);
        }
        catch (err) {
            console.error(err);
        }
    });
});
Then(/^The journal "([\w-]+)" should have only (\d+) editors left$/, (eventJournalId, expectedEditorsLeft) => __awaiter(void 0, void 0, void 0, function* () {
    const editorCollectionAfter = yield mockEditorRepo.getEditorCollection();
    expect(editorCollectionAfter.length).to.equal(+expectedEditorsLeft);
}));
//# sourceMappingURL=journalEditorRemoved.steps.js.map