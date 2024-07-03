import { cancel, confirm, note, outro, text } from '@clack/prompts';

import { autoCommit, oraSpinner } from '@/utils';

async function selectAIMsgOrManualMsg(msg: string) {
  const code = await autoCommit(msg);
  if (code === 0) {
    outro('提交成功');
  } else {
    cancel('提交失败');
  }
}

export default async (aiCommitMsg: string) => {
  note(aiCommitMsg);
  const answer = await confirm({
    message: '是否满意AI生成的提交信息？',
    active: '满意',
    inactive: '不满意',
  });
  if (answer) {
    const initSpinner = oraSpinner('正在提交...');
    initSpinner.start();
    await selectAIMsgOrManualMsg(aiCommitMsg);
    initSpinner.stop();
  } else {
    // 让用户自己手动输入提交信息再提交
    const manualMsg = await text({
      message: '请您手动输入需要的commit信息',
      placeholder: 'commit信息',
    });
    const initSpinner = oraSpinner('正在提交...');
    initSpinner.start();
    if (typeof manualMsg === 'string' && manualMsg) {
      await selectAIMsgOrManualMsg(manualMsg as string);
      initSpinner.stop();
    }
  }
};
