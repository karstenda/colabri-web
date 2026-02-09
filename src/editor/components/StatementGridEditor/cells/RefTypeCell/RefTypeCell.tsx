import CellWrapper from '../CellWrapper';
import ContentTag from '../../../ContentTag/ContentTag';
import { Skeleton, Stack } from '@mui/material';
import { useColabDoc } from '../../../../context/ColabDocContext/ColabDocProvider';
import { ConnectedStmtDoc, FrozenStmtDoc } from '../../../../data/ColabDoc';
import FrozenReferenceTag from '../../../ReferenceTag/FrozenReferenceTag';
import LiveReferenceTag from '../../../ReferenceTag/LiveReferenceTag';

export type RefTypeCellProps = {
  hasFocus: boolean;
};

const RefTypeCell = ({ hasFocus }: RefTypeCellProps) => {
  const { colabDoc } = useColabDoc();
  if (
    colabDoc &&
    !(colabDoc instanceof ConnectedStmtDoc) &&
    !(colabDoc instanceof FrozenStmtDoc)
  ) {
    throw new Error('RefTypeCell can only be used within statement documents.');
  }

  const controller = colabDoc?.getDocController();
  const contentTypeCode = controller?.getContentType();

  return (
    <CellWrapper>
      <Stack direction="row" spacing={1} flex={0} width="100%">
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
        {colabDoc instanceof FrozenStmtDoc && (
          <FrozenReferenceTag onClick={() => {}} />
        )}
        {colabDoc instanceof ConnectedStmtDoc && (
          <LiveReferenceTag onClick={() => {}} />
        )}
      </Stack>
    </CellWrapper>
  );
};

export default RefTypeCell;
