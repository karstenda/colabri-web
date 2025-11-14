import { createContext } from "react";
import { ColabDoc } from "../../data/ColabDoc";


export type ColabDocContextType = {
    docId: string | null;
    colabDoc: ColabDoc | null;
    updateColabDoc: ((delta: Uint8Array<ArrayBufferLike>) => void) | null;
}

const ColabDocContext = createContext<ColabDocContextType | null>(null);

export default ColabDocContext;

