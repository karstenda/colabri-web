import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import CellWrapper from '../CellWrapper';
import ContentTag from '../../../ContentTag/ContentTag';
import { Skeleton } from '@mui/material';
import { useColabDoc } from '../../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedStmtDoc } from '../../../../data/ConnectedColabDoc';

export type RefTypeCellProps = {
  hasFocus: boolean;
};

const RefTypeCell = ({ hasFocus }: RefTypeCellProps) => {
  const { colabDoc } = useColabDoc();
  if (colabDoc && !(colabDoc instanceof ConnectedStmtDoc)) {
    throw new Error(
      'RefTypeCell can only be used within connected statement documents.',
    );
  }

  const controller = colabDoc?.getDocController();
  const contentTypeCode = controller?.getContentType();

  return (
    <CellWrapper>
      {contentTypeCode && (
        <ContentTag
          size={'medium'}
          type={'contentType'}
          code={contentTypeCode}
        />
      )}
      {!contentTypeCode && (
        <Skeleton
          variant="rectangular"
          width={140}
          height={32}
          sx={{ borderRadius: 16 }}
        />
      )}
    </CellWrapper>
  );
};

export default RefTypeCell;
