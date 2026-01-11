import {
  PlatformContentLanguage,
  PlatformCountry,
} from '../../../api/ColabriAPI';

export type AutoSetupFormData = {
  countries: PlatformCountry[];
  languages: PlatformContentLanguage[];
  product: {
    name?: string;
    attributeValues?: Record<string, string>;
  };
};
