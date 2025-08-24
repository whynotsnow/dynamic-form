// 批量更新测试工具
export function testBatchUpdateLogic() {
  console.log('[Test] 开始测试批量更新逻辑');

  // 模拟 pendingUpdatesRef
  const pendingUpdates: Record<string, any> = {};

  // 模拟 addToUpdateQueue 函数
  const addToUpdateQueue = (fieldId: string, value: any) => {
    pendingUpdates[fieldId] = value;
    console.log(`[Test] 添加字段 ${fieldId} = ${value} 到队列`);
  };

  // 模拟 batchDispatch 函数
  const batchDispatch = () => {
    const updates = { ...pendingUpdates };
    console.log(`[Test] 执行批量更新:`, updates);

    // 清空队列
    Object.keys(pendingUpdates).forEach((key) => {
      delete pendingUpdates[key];
    });
  };

  // 测试场景 1: 用户输入
  console.log('\n[Test] 场景 1: 用户输入 employeeCount = 300');
  addToUpdateQueue('employeeCount', 300);
  batchDispatch();

  // 测试场景 2: Effect 执行
  console.log('\n[Test] 场景 2: Effect 返回 employeeCount = 600');
  addToUpdateQueue('employeeCount', 600);
  batchDispatch();

  // 测试场景 3: 多个字段同时更新
  console.log('\n[Test] 场景 3: 多个字段同时更新');
  addToUpdateQueue('employeeCount', 600);
  addToUpdateQueue('companySize', '大型企业');
  batchDispatch();

  // 测试场景 4: 验证队列清空
  console.log('\n[Test] 场景 4: 验证队列清空');
  console.log('队列内容:', pendingUpdates);

  console.log('\n[Test] 批量更新测试完成');
}

// 测试重复调用问题
export function testDuplicateCalls() {
  console.log('[Test] 开始测试重复调用问题');

  const pendingUpdates: Record<string, any> = {};
  const updateHistory: string[] = [];

  const addToUpdateQueue = (fieldId: string, value: any) => {
    pendingUpdates[fieldId] = value;
    updateHistory.push(`${fieldId} = ${value}`);
    console.log(`[Test] 添加字段 ${fieldId} = ${value} 到队列`);
  };

  const batchDispatch = () => {
    const updates = { ...pendingUpdates };
    console.log(`[Test] 执行批量更新:`, updates);

    // 清空队列
    Object.keys(pendingUpdates).forEach((key) => {
      delete pendingUpdates[key];
    });
  };

  // 模拟用户输入和 Effect 执行的时序
  console.log('\n[Test] 模拟用户输入 employeeCount = 300');
  addToUpdateQueue('employeeCount', 300);
  batchDispatch();

  console.log('\n[Test] Effect 执行，返回 employeeCount = 600');
  addToUpdateQueue('employeeCount', 600);
  batchDispatch();

  console.log('\n[Test] 更新历史:', updateHistory);
  console.log('[Test] 重复调用测试完成');
}

// 验证批量更新的正确性
export function validateBatchUpdate() {
  console.log('[Test] 验证批量更新正确性');

  const testCases = [
    {
      name: '单个字段更新',
      inputs: [{ fieldId: 'test1', value: 'value1' }],
      expected: { test1: 'value1' }
    },
    {
      name: '多个字段更新',
      inputs: [
        { fieldId: 'test1', value: 'value1' },
        { fieldId: 'test2', value: 'value2' }
      ],
      expected: { test1: 'value1', test2: 'value2' }
    },
    {
      name: '字段值覆盖',
      inputs: [
        { fieldId: 'test1', value: 'value1' },
        { fieldId: 'test1', value: 'value2' }
      ],
      expected: { test1: 'value2' }
    }
  ];

  testCases.forEach((testCase) => {
    console.log(`\n[Test] 测试: ${testCase.name}`);

    const pendingUpdates: Record<string, any> = {};

    testCase.inputs.forEach((input) => {
      pendingUpdates[input.fieldId] = input.value;
    });

    const isCorrect = JSON.stringify(pendingUpdates) === JSON.stringify(testCase.expected);
    console.log(`  输入:`, testCase.inputs);
    console.log(`  结果:`, pendingUpdates);
    console.log(`  期望:`, testCase.expected);
    console.log(`  正确: ${isCorrect ? '✅' : '❌'}`);
  });

  console.log('\n[Test] 批量更新验证完成');
}
