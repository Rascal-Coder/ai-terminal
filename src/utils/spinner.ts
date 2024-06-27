import Spinner, { SpinnerName } from "cli-spinners";
import ora from "ora";
/**
 * 创建一个自定义的 ora spinner
 * @param  msg - 显示的消息文本
 * @param  spinnerStr - spinner 的名称
 * @returns  - 返回一个 ora spinner 实例
 */
export const oraSpinner = (
  msg: string = "Loading...",
  spinnerStr: SpinnerName = "dots"
) => {
  const cliSpinners = Spinner[spinnerStr];
  const oraSpinnerInstance = ora({
    text: msg,
    spinner: cliSpinners,
    hideCursor: false,
  });
  return oraSpinnerInstance;
};
