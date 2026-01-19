import { LoroMap } from 'loro-crdt';
import { StmtDocSchema } from '../../../../data/ColabDoc';
import CellWrapper from './CellWrapper';
import ContentTag from '../../../ContentTag/ContentTag';
import { Skeleton } from '@mui/material';

export type LocalNameCellProps = {
  statement: LoroMap<StmtDocSchema>;
};

const LocalNameCell = ({ statement }: LocalNameCellProps) => {
  const contentTypeCode = statement?.get('properties')?.get('contentType');

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

export default LocalNameCell;
