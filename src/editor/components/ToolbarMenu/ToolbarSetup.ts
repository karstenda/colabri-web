import { FormattingSetup } from './FormattingMenuSetup';

export type ToolbarSetups = Record<string, ToolbarSetup>;

export type ToolbarSetup = {
  id: string;
  formatting: FormattingSetup;
};
