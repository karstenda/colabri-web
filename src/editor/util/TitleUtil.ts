import { ColabSheetBlockTitleType } from '../../api/ColabriAPI';

export const getTypographyVariantForTitleType = (
  titleType: ColabSheetBlockTitleType,
) => {
  switch (titleType) {
    case ColabSheetBlockTitleType.ColabSheetBlockTitleLevel1:
      return 'h4';
    case ColabSheetBlockTitleType.ColabSheetBlockTitleLevel2:
      return 'h6';
    case ColabSheetBlockTitleType.ColabSheetBlockTitleLevel3:
      return 'subtitle1';
    case ColabSheetBlockTitleType.ColabSheetBlockTitleLevel4:
      return 'subtitle2';
    default:
      return 'h6';
  }
};
