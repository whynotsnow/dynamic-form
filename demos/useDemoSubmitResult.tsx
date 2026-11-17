import { createContext, useCallback, useContext, useState } from 'react';
import { Modal } from 'antd';

export interface DemoSubmitResultMessages {
  title: string;
  description: string;
  confirm: string;
  cancel: string;
}

export const DemoSubmitResultContext = createContext<DemoSubmitResultMessages>({
  title: '本次提交数据',
  description: '以下为本次传入 onSubmit 的数据：',
  confirm: '确认',
  cancel: '取消'
});

export const useDemoSubmitResult = () => {
  const messages = useContext(DemoSubmitResultContext);
  const [isOpen, setIsOpen] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<unknown>();

  const showSubmitResult = useCallback((values: unknown) => {
    setSubmittedValues(values);
    setIsOpen(true);
  }, []);

  const submitResultModal = (
    <Modal
      title={messages.title}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      onOk={() => setIsOpen(false)}
      okText={messages.confirm}
      cancelText={messages.cancel}
      width={720}
    >
      <p>{messages.description}</p>
      <pre
        style={{
          maxHeight: '60vh',
          margin: 0,
          overflow: 'auto',
          padding: 12,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere'
        }}
      >
        {JSON.stringify(submittedValues, null, 2) ?? 'undefined'}
      </pre>
    </Modal>
  );

  return { showSubmitResult, submitResultModal };
};
