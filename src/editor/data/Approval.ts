import { ColabApprovalState, ColabUserApproval } from '../../api/ColabriAPI';
import { UserApprovalLoro } from './ColabLoroDoc';

export const getApprovalColor = (
  state: string,
  mode: 'light' | 'dark',
  hover: boolean,
) => {
  const isDark = mode === 'dark';
  switch (state) {
    case 'draft':
      if (isDark) return hover ? '#BDBDBD' : '#9E9E9E';
      return hover ? '#BDBDBD' : '#E0E0E0';
    case 'pending':
      if (isDark) return hover ? '#64B5F6' : '#42A5F5';
      return hover ? '#64B5F6' : '#90CAF9';
    case 'approved':
      if (isDark) return hover ? '#81C784' : '#66BB6A';
      return hover ? '#81C784' : '#A5D6A7';
    case 'rejected':
      if (isDark) return hover ? '#E57373' : '#EF5350';
      return hover ? '#E57373' : '#EF9A9A';
    default:
      if (isDark) return hover ? '#BDBDBD' : '#9E9E9E';
      return hover ? '#BDBDBD' : '#E0E0E0';
  }
};

export const getApprovalStateFromApprovals = (
  approvalMap: Record<string, ColabUserApproval> | undefined,
): ColabApprovalState => {
  if (!approvalMap || Object.keys(approvalMap).length === 0) {
    return ColabApprovalState.Draft;
  } else {
    // Iterate over the approvals to see if any are pending
    let lowestStateScore = 4;
    for (let [key, value] of Object.entries(approvalMap)) {
      const approval = value;
      // Associate a score with this state
      let score = 1;
      if (approval.state === ColabApprovalState.Rejected) {
        score = 0;
      } else if (approval.state === ColabApprovalState.Approved) {
        score = 3;
      } else if (approval.state === ColabApprovalState.Pending) {
        score = 2;
      } else if (approval.state === ColabApprovalState.Draft) {
        score = 1;
      }

      if (score < lowestStateScore) {
        lowestStateScore = score;
      }
    }

    // Map the lowest score back to a state
    if (lowestStateScore === 3) {
      return ColabApprovalState.Approved;
    } else if (lowestStateScore === 2) {
      return ColabApprovalState.Pending;
    } else if (lowestStateScore === 1) {
      return ColabApprovalState.Draft;
    } else if (lowestStateScore === 0) {
      return ColabApprovalState.Rejected;
    } else {
      console.log('Unknown state score: ' + lowestStateScore);
      return ColabApprovalState.Draft;
    }
  }
};
