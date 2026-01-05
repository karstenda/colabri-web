import { Plugin as ProseMirrorPlugin } from 'prosemirror-state';
import {
  createSpellCheckEnabledStore,
  createProofreadPlugin,
} from 'prosemirror-proofread';
import { Api } from '../../../../../api/ColabriAPI';
import { SpellCheckSuggestionBoxProps } from './SpellCheckSuggestionBox';
import {
  getCachedSpellCheckResult,
  setCachedSpellCheckResult,
  SpellCheckCachePayload,
} from './SpellCheckCache';

export type SpellCheckPluginProps = {
  orgId: string;
  langCode?: string;
  setSuggestionBox: (props: SpellCheckSuggestionBoxProps | null) => void;
};

const apiClient = new Api({
  baseUrl: '/api/v1',
  baseApiParams: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

const normalizeMatches = (payload: any): SpellCheckCachePayload => ({
  ...payload,
  matches: (payload?.matches || []).map((match: any): any => ({
    ...match,
    message: match?.message || '',
    offset: match?.offset || 0,
    length: match?.length || 0,
    type: { typeName: match?.rule?.issueType || 'spelling' },
  })),
});

const SpellCheckPlugin = ({
  orgId,
  langCode = 'auto',
  setSuggestionBox,
}: SpellCheckPluginProps): ProseMirrorPlugin => {
  const spellCheckEnabledStore = createSpellCheckEnabledStore(() => {
    true;
  });

  /**
   * Generate the proofread errors by calling the Colabri spell check API
   * @param input
   * @returns
   */
  const generateProofreadErrors = async (input: string) => {
    const trimmedInput = input?.trim();
    if (!trimmedInput) return { matches: [] };

    const cached = getCachedSpellCheckResult(langCode, trimmedInput);
    if (cached) {
      return cached;
    }

    try {
      const response = await apiClient.orgId.postSpellCheck(orgId, {
        language: langCode,
        text: trimmedInput,
      });
      const normalized = normalizeMatches(response.data || { matches: [] });
      setCachedSpellCheckResult(langCode, trimmedInput, normalized);
      return normalized;
    } catch (error) {
      console.error('Error:', error);
      return { matches: [] };
    }
  };

  const createColabriSuggestionBox = ({
    error,
    position,
    onReplace,
    onIgnore,
    onClose,
  }: {
    error: any;
    position: any;
    onReplace: any;
    onIgnore: any;
    onClose: any;
  }): { destroy: () => void } => {
    setSuggestionBox({
      error,
      position,
      onReplace,
      onIgnore,
      onClose,
    });

    const handleScroll = () => {
      setSuggestionBox(null);
    };

    window.addEventListener('scroll', handleScroll, { capture: true });

    return {
      destroy: () => {
        window.removeEventListener('scroll', handleScroll, { capture: true });
        setSuggestionBox(null);
      },
    };
  };

  return createProofreadPlugin(
    1000, // Debounce time in ms
    generateProofreadErrors, // function to call proofreading service
    createColabriSuggestionBox, // Suggestion box function
    spellCheckEnabledStore, // Reactive store to toggle spell checking
  );
};
export default SpellCheckPlugin;
