/**
 * AudioEngine - 四季环境音效引擎
 *
 * 职责：
 * 1. loading 阶段预加载默认季节音频（preload），点击 ENTER 瞬间播放（start）
 * 2. 季节切换时懒加载新季节音频，交叉淡入淡出
 * 3. 右上角按钮控制播放/静音（toggle）
 *
 * 音频文件映射：
 * - winter ← snow.mp3
 * - spring ← spring.mp3
 * - summer ← summer.mp3
 * - autumn ← autumn.mp3
 */

/** 季节类型 */
type Season = 'winter' | 'spring' | 'summer' | 'autumn';

/** 季节对应的音频文件路径 */
const AUDIO_SOURCES: Record<Season, string> = {
  winter: '/white_noise/snow.mp3',
  spring: '/white_noise/spring.mp3',
  summer: '/white_noise/summer.mp3',
  autumn: '/white_noise/autumn.mp3',
};

/** 交叉淡入淡出时间（秒） */
const CROSSFADE_DURATION = 1.0;

export const AudioEngine = {
  ctx: null as AudioContext | null,
  /** 主输出增益节点 */
  mainGain: null as GainNode | null,
  /** 各季节的音频元素和独立增益节点（按需加载） */
  sources: {} as Partial<Record<Season, { audio: HTMLAudioElement; gain: GainNode }>>,
  playing: false,
  currentSeason: 'winter' as Season,
  /** crossfade 淡出暂停定时器 ID（快速切换季节时取消上一次） */
  _fadeoutTimers: [] as ReturnType<typeof setTimeout>[],

  /**
   * 预加载：loading 阶段调用
   * - 创建 AudioContext
   * - 仅下载当前默认季节的音频文件（不播放）
   *
   * 在 SeasonProvider mount 时自动调用，
   * 确保用户点击 ENTER 前音频已解码完毕
   */
  preload() {
    if (this.ctx) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();

    // 主输出增益（初始静音）
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.value = 0;
    this.mainGain.connect(this.ctx.destination);

    // 仅预加载默认季节，其他季节在切换时按需加载
    this.loadSeason(this.currentSeason);
  },

  /**
   * 按需加载单个季节的音频
   * 创建 HTMLAudioElement → MediaElementSource → GainNode 链路
   */
  loadSeason(season: Season) {
    if (!this.ctx || !this.mainGain || this.sources[season]) return;

    const audio = new Audio(AUDIO_SOURCES[season]);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';

    const mediaSource = this.ctx.createMediaElementSource(audio);
    const gain = this.ctx.createGain();
    gain.gain.value = 0; // 初始静音，由 crossfade/start 控制

    mediaSource.connect(gain);
    gain.connect(this.mainGain);

    this.sources[season] = { audio, gain };
  },

  /**
   * 开始播放：用户点击 ENTER EXPERIENCE 时调用
   *
   * 流程：
   * 1. 确保 AudioContext 已创建（preload 应已完成）
   * 2. 如果 AC 因浏览器策略处于 suspended，等待 resume
   * 3. 确保当前季节音频已加载并开始播放
   * 4. 主增益淡入
   */
  async start() {
    if (!this.ctx) this.preload();

    // 浏览器 Autoplay Policy：需用户手势后恢复 AudioContext
    if (this.ctx!.state === 'suspended') {
      await this.ctx!.resume();
    }

    // 确保当前季节音频已加载
    this.loadSeason(this.currentSeason);

    const source = this.sources[this.currentSeason];
    if (!source) return;

    this.playing = true;

    const now = this.ctx!.currentTime;

    // 当前季节增益淡入
    source.gain.gain.setValueAtTime(0, now);
    source.gain.gain.linearRampToValueAtTime(1, now + 0.5);

    // 主输出增益淡入
    this.mainGain!.gain.setValueAtTime(0, now);
    this.mainGain!.gain.linearRampToValueAtTime(1, now + 1.5);

    // 开始播放（用户手势下不再会被阻止）
    source.audio.play().catch(console.error);

    // 派发事件供 UI 更新按钮状态
    window.dispatchEvent(new CustomEvent('audio-toggle', { detail: true }));
  },

  /**
   * 切换季节音效
   * 由 SeasonContext 在季节变化时触发
   * 新季节音频按需加载，然后交叉淡入淡出
   */
  setSeason(season: Season) {
    if (this.currentSeason === season) return;
    this.currentSeason = season;
    if (!this.ctx) this.preload();
    this.loadSeason(season);
    this.crossfade(season);
  },

  /**
   * 交叉淡入淡出
   * 新季节音频淡入播放，其他季节音频淡出后暂停
   */
  crossfade(season: Season) {
    if (!this.ctx) return;

    // H-03 修复：取消上一次淡出定时器，防止快速切换季节时竞态
    for (const timerId of this._fadeoutTimers) clearTimeout(timerId);
    this._fadeoutTimers = [];

    const now = this.ctx.currentTime;
    const endTime = now + CROSSFADE_DURATION;

    for (const [s, entry] of Object.entries(this.sources) as [Season, { audio: HTMLAudioElement; gain: GainNode }][]) {
      if (s === season) {
        entry.audio.play().catch(() => {});
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(1, endTime);
      } else {
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(0, endTime);
        const audioRef = entry.audio;
        const timerId = setTimeout(() => {
          audioRef.pause();
        }, CROSSFADE_DURATION * 1000 + 200);
        this._fadeoutTimers.push(timerId);
      }
    }
  },

  /**
   * 切换播放/静音状态
   * 右上角 SOUND ON/OFF 按钮使用
   * @param forceState 可选，强制指定播放状态
   */
  toggle(forceState?: boolean) {
    // H-05 修复：先检查 ctx/mainGain 是否就绪，未就绪时不修改 playing 状态
    if (!this.ctx || !this.mainGain) return;

    if (forceState !== undefined) this.playing = forceState;
    else this.playing = !this.playing;

    const now = this.ctx.currentTime;
    this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, now);
    this.mainGain.gain.linearRampToValueAtTime(this.playing ? 1 : 0, now + 1.5);

    // 播放时恢复当前季节的音频
    if (this.playing) {
      const current = this.sources[this.currentSeason];
      if (current) current.audio.play().catch(() => {});
    }

    // 派发事件供 UI 更新按钮状态
    window.dispatchEvent(new CustomEvent('audio-toggle', { detail: this.playing }));
  },

  /** 滚动速度回调（保留接口兼容） */
  update(_velocity: number) {},
};
