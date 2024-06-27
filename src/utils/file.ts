/**
 * 计算下载速度。
 * 
 * 根据已下载的长度和开始下载的时间，计算当前的下载速度。
 * 速度单位为KB/秒。
 * 
 * @param downloadedLength 已下载的字节数。
 * @param startTime 开始下载的时间戳（毫秒）。
 * @returns 返回计算出的下载速度，单位为KB/秒。
 */
export function calculateSpeed(downloadedLength: number, startTime: number): string {
    // 计算已过去的时间，单位为毫秒。
    const elapsedTime = Date.now() - startTime;
    // 根据已下载的长度和时间计算下载速度，单位为字节/毫秒。
    const speed = downloadedLength / elapsedTime; // 字节/毫秒
    // 将下载速度转换为KB/毫秒。
    const speedInKB = speed / 1024; // KB/毫秒
    // 返回格式化后的下载速度，保留两位小数，单位为KB/秒。
    return `${speedInKB.toFixed(2)} KB/s`; // 保留两位小数
  }

/**
 * 根据字节大小格式化文件大小。
 * 
 * 此函数将字节大小转换为更易读的格式，如MB或KB，如果大小小于1024字节，则显示字节大小。
 * 转换过程中保留两位小数。
 * 
 * @param sizeInBytes 文件的字节大小。
 * @returns 格式化后的文件大小字符串。
 */
export function formatSize(sizeInBytes: number): string {
    // 如果字节大小大于等于1MB（1024 * 1024字节），转换为MB并保留两位小数
    if (sizeInBytes >= 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    // 如果字节大小大于等于1KB（1024字节），转换为KB并保留两位小数
    } else if (sizeInBytes >= 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    // 如果字节大小小于1KB，直接显示字节大小
    } else {
      return `${sizeInBytes} bytes`;
    }
  }
