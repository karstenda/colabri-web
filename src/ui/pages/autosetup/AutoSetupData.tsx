import {
  OrgCountry,
  PlatformContentLanguage,
  PlatformCountry,
} from '../../../api/ColabriAPI';
import { ContentLanguage } from '../../../editor/data/ContentLanguage';

export type AutoSetupFormData = {
  countries: PlatformCountry[];
  languages: PlatformContentLanguage[];
  product: {
    id?: string;
    name?: string;
    attributeValues?: Record<string, string>;
  };
  sheet: {
    name?: string;
    languages?: ContentLanguage[];
    masterLanguage?: ContentLanguage | null;
    countries?: OrgCountry[];
  };
};
