import { useRemarkSync } from 'react-remark';

const MarkDownContent = ({ content }: { content: string }) => {
  const reactContent = useRemarkSync(content);

  return reactContent;
};

export default MarkDownContent;
