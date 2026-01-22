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
