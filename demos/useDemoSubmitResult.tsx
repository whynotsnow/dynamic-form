import { useCallback, useState } from 'react';
import { Modal } from 'antd';

export const useDemoSubmitResult = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submittedValues, setSubmittedValues] = useState<unknown>();

  const showSubmitResult = useCallback((values: unknown) => {
    setSubmittedValues(values);
    setIsOpen(true);
  }, []);

  const submitResultModal = (
    <Modal
      title="本次提交数据"
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      onOk={() => setIsOpen(false)}
      okText="确认"
      cancelText="取消"
      width={720}
    >
      <p>以下为表单校验通过后传入 onSubmit 的数据：</p>
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
