/**
 * Client half of the DeepSeek cursor halo.
 *
 * A transparent, frame-wide overlay follows the pointer and draws:
 *   - a solid DeepSeek-blue core at the pointer,
 *   - a breathing halo that fades to transparent outward, and
 *   - a continuous motion trail rendered as a canvas stroke.
 *
 * The halo is pure CSS. The trail is drawn on a DPR-aware canvas so fast
 * pointer movement produces one continuous tapered line instead of a row of
 * disconnected dots. The layer sits above every other surface and the core
 * paints above the halo and trail.
 */

window.__ModuleLoader__.load({
  id: "@local/dsh-cursor-halo",
  factory(require) {
    const CURSOR_HIDE_CLASS = "dsh-cursor-halo--hide-native-cursor";
    const TRAIL_MAX_POINTS = 160;
    const CLICK_PULSE_MS = 260;
    const CLICK_PULSE_SCALE = 0.32;
    const SETTINGS_KEY = "dsh.cursor-halo.settings.v1";
    const DEFAULT_SETTINGS = Object.freeze({
      trailEnabled: true,
      trailDuration: 320,
      haloEnabled: true,
      haloSize: 88,
      breathingEnabled: true,
      breathingPeriod: 6000,
      dotMode: true,
      hideOnMenu: true,
    });
    const SETTINGS_BOUNDS = {
      trailDuration: { min: 80, max: 1200 },
      haloSize: { min: 40, max: 180 },
      breathingPeriod: { min: 1000, max: 12000 },
    };
    const clampSetting = (value, min, max, fallback) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return fallback;
      return Math.min(max, Math.max(min, Math.round(numeric)));
    };
    const normalizeSettings = (input) => {
      const raw = input && typeof input === "object" ? input : {};
      return {
        trailEnabled: raw.trailEnabled !== false,
        trailDuration: clampSetting(
          raw.trailDuration,
          SETTINGS_BOUNDS.trailDuration.min,
          SETTINGS_BOUNDS.trailDuration.max,
          DEFAULT_SETTINGS.trailDuration,
        ),
        haloEnabled: raw.haloEnabled !== false,
        haloSize: clampSetting(
          raw.haloSize,
          SETTINGS_BOUNDS.haloSize.min,
          SETTINGS_BOUNDS.haloSize.max,
          DEFAULT_SETTINGS.haloSize,
        ),
        breathingEnabled: raw.breathingEnabled !== false,
        breathingPeriod: clampSetting(
          raw.breathingPeriod,
          SETTINGS_BOUNDS.breathingPeriod.min,
          SETTINGS_BOUNDS.breathingPeriod.max,
          DEFAULT_SETTINGS.breathingPeriod,
        ),
        dotMode: raw.dotMode !== false,
        hideOnMenu: raw.hideOnMenu !== false,
      };
    };
    const loadSettings = () => {
      try {
        return normalizeSettings(
          JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "{}"),
        );
      } catch {
        return normalizeSettings(DEFAULT_SETTINGS);
      }
    };
    const settingsStore = {
      current: loadSettings(),
      listeners: new Set(),
    };
    const getSettings = () => settingsStore.current;
    const updateSettings = (patch) => {
      const next = normalizeSettings({ ...settingsStore.current, ...patch });
      const changed = Object.keys(next).some(
        (key) => next[key] !== settingsStore.current[key],
      );
      if (!changed) return settingsStore.current;
      settingsStore.current = next;
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* Settings remain live for this run even if storage is unavailable. */
      }
      for (const listener of [...settingsStore.listeners]) {
        try {
          listener(next);
        } catch (error) {
          console.error("[dsh-cursor-halo] settings listener failed:", error);
        }
      }
      return next;
    };
    const subscribeSettings = (listener) => {
      settingsStore.listeners.add(listener);
      return () => {
        settingsStore.listeners.delete(listener);
      };
    };
    const resetSettings = () => {
      updateSettings(DEFAULT_SETTINGS);
    };
    const NS = "dsh-cursor-halo";
    const LANGUAGE_PACKS = [
      { id: "fr", label: "Français" },
      { id: "ru", label: "Русский" },
      { id: "ja", label: "日本語" },
    ];
    const DICTS = {
      en: {
        nav: "Cursor Halo",
        title: "Cursor Halo",
        intro:
          "Tune the pointer, halo and trail. Changes apply immediately and are saved locally.",
        pointerGroup: "Pointer",
        dotMode: "Replace pointer with a blue dot",
        dotModeDesc:
          "Turn off to show the native pointer and hide the blue dot.",
        hideOnMenu: "Hide over all overlays",
        hideOnMenuDesc:
          "Hide the effect and restore the native pointer over every overlay, including menus, dropdowns, dialogs and settings. Turn off to keep the effect over all overlays.",
        haloGroup: "Halo",
        haloEnabled: "Show halo",
        haloEnabledDesc: "Draw the glow that fades out around the pointer.",
        haloSize: "Halo size",
        haloSizeDesc: "Diameter of the halo.",
        breathingEnabled: "Breathing animation",
        breathingEnabledDesc:
          "Let the halo contract and expand over time.",
        breathingPeriod: "Breathing period",
        breathingPeriodDesc: "Time for one complete breath.",
        trailGroup: "Trail",
        trailEnabled: "Show trail",
        trailEnabledDesc:
          "Draw a continuous blue line while moving.",
        trailDuration: "Trail duration",
        trailDurationDesc:
          "How much pointer history the trail keeps.",
        autoSave:
          "Settings are saved locally and survive a restart.",
        reset: "Reset to defaults",
        milliseconds: "ms",
        pixels: "px",
        seconds: "s",
      },
      zh: {
        nav: "光标呼吸灯",
        title: "光标呼吸灯",
        intro:
          "调整鼠标指针、光晕和拖尾。修改会立即生效，并自动保存在本机。",
        pointerGroup: "鼠标指针",
        dotMode: "将鼠标替换为蓝点",
        dotModeDesc: "关闭后显示系统鼠标指针，并隐藏蓝色圆点。",
        hideOnMenu: "在所有弹层上隐藏",
        hideOnMenuDesc:
          "在菜单、下拉列表、对话框和设置面板等全部弹层上隐藏效果并恢复系统指针；关闭后所有弹层上也会保持效果。",
        haloGroup: "光晕",
        haloEnabled: "开启光晕",
        haloEnabledDesc: "在指针周围显示从中心向外渐隐的光晕。",
        haloSize: "光晕大小",
        haloSizeDesc: "光晕的直径。",
        breathingEnabled: "开启闪动",
        breathingEnabledDesc: "光晕随时间收缩和扩张。",
        breathingPeriod: "闪动周期",
        breathingPeriodDesc: "一次完整呼吸所需的时间。",
        trailGroup: "拖尾",
        trailEnabled: "开启拖尾",
        trailEnabledDesc: "移动鼠标时绘制连续的蓝色尾线。",
        trailDuration: "拖尾时长",
        trailDurationDesc: "尾线保留的历史轨迹时长。",
        autoSave: "设置会自动保存在本机，下次启动仍然有效。",
        reset: "恢复默认",
        milliseconds: "毫秒",
        pixels: "像素",
        seconds: "秒",
      },
      fr: {
        nav: "Halo du curseur",
        title: "Halo du curseur",
        intro:
          "Réglez le pointeur, le halo et la traînée. Les modifications s'appliquent immédiatement et sont enregistrées localement.",
        pointerGroup: "Pointeur",
        dotMode: "Remplacer le pointeur par un point bleu",
        dotModeDesc:
          "Désactivez pour afficher le pointeur système et masquer le point bleu.",
        hideOnMenu: "Masquer sur tous les overlays",
        hideOnMenuDesc:
          "Masque l'effet et rétablit le pointeur système sur tous les overlays, y compris les menus, listes déroulantes, boîtes de dialogue et réglages. Désactivez pour conserver l'effet sur tous les overlays.",
        haloGroup: "Halo",
        haloEnabled: "Afficher le halo",
        haloEnabledDesc:
          "Affiche le halo qui s'estompe autour du pointeur.",
        haloSize: "Taille du halo",
        haloSizeDesc: "Diamètre du halo.",
        breathingEnabled: "Animation de respiration",
        breathingEnabledDesc:
          "Le halo se contracte et s'étend au fil du temps.",
        breathingPeriod: "Période de respiration",
        breathingPeriodDesc: "Durée d'une respiration complète.",
        trailGroup: "Traînée",
        trailEnabled: "Afficher la traînée",
        trailEnabledDesc:
          "Trace une ligne bleue continue pendant le déplacement.",
        trailDuration: "Durée de la traînée",
        trailDurationDesc:
          "Durée de l'historique du pointeur conservée.",
        autoSave:
          "Les réglages sont enregistrés localement et conservés après redémarrage.",
        reset: "Réinitialiser",
        milliseconds: "ms",
        pixels: "px",
        seconds: "s",
      },
      ru: {
        nav: "Ореол курсора",
        title: "Ореол курсора",
        intro:
          "Настройте указатель, ореол и след. Изменения применяются сразу и сохраняются на этом устройстве.",
        pointerGroup: "Указатель",
        dotMode: "Заменить указатель синей точкой",
        dotModeDesc:
          "Выключите, чтобы показывать системный указатель и скрыть синюю точку.",
        hideOnMenu: "Скрывать на всех всплывающих слоях",
        hideOnMenuDesc:
          "Скрывает эффект и возвращает системный указатель на всех всплывающих слоях: в меню, выпадающих списках, диалогах и настройках. Выключите, чтобы сохранять эффект на всех слоях.",
        haloGroup: "Ореол",
        haloEnabled: "Показывать ореол",
        haloEnabledDesc:
          "Показывает ореол, плавно исчезающий вокруг указателя.",
        haloSize: "Размер ореола",
        haloSizeDesc: "Диаметр ореола.",
        breathingEnabled: "Анимация дыхания",
        breathingEnabledDesc:
          "Ореол сжимается и расширяется во времени.",
        breathingPeriod: "Период дыхания",
        breathingPeriodDesc: "Время одного полного цикла дыхания.",
        trailGroup: "След",
        trailEnabled: "Показывать след",
        trailEnabledDesc:
          "Рисует непрерывную синюю линию при движении.",
        trailDuration: "Длительность следа",
        trailDurationDesc:
          "Сколько истории указателя сохраняет след.",
        autoSave:
          "Настройки сохраняются на этом устройстве и действуют после перезапуска.",
        reset: "Сбросить настройки",
        milliseconds: "мс",
        pixels: "пикс.",
        seconds: "с",
      },
      ja: {
        nav: "カーソルハロー",
        title: "カーソルハロー",
        intro:
          "ポインター、ハロー、トレイルを調整できます。変更はすぐに反映され、この端末に保存されます。",
        pointerGroup: "ポインター",
        dotMode: "ポインターを青い点に置き換える",
        dotModeDesc:
          "オフにするとシステムのポインターを表示し、青い点を非表示にします。",
        hideOnMenu: "すべてのオーバーレイで隠す",
        hideOnMenuDesc:
          "メニュー、ドロップダウン、ダイアログ、設定画面などのすべてのオーバーレイで効果を隠し、システムのポインターに戻します。オフにするとすべてのオーバーレイで効果を表示します。",
        haloGroup: "ハロー",
        haloEnabled: "ハローを表示",
        haloEnabledDesc:
          "ポインターの周囲に外側へフェードするハローを表示します。",
        haloSize: "ハローのサイズ",
        haloSizeDesc: "ハローの直径。",
        breathingEnabled: "呼吸アニメーション",
        breathingEnabledDesc:
          "ハローが時間とともに縮小・拡大します。",
        breathingPeriod: "呼吸の周期",
        breathingPeriodDesc: "1回の呼吸にかかる時間。",
        trailGroup: "トレイル",
        trailEnabled: "トレイルを表示",
        trailEnabledDesc:
          "マウスを動かすと連続した青い線を描画します。",
        trailDuration: "トレイルの長さ",
        trailDurationDesc:
          "トレイルが保持するポインター履歴の時間。",
        autoSave:
          "設定はこの端末に保存され、再起動後も有効です。",
        reset: "初期設定に戻す",
        milliseconds: "ミリ秒",
        pixels: "ピクセル",
        seconds: "秒",
      },
    };
    const CSS = `
html.${CURSOR_HIDE_CLASS},
html.${CURSOR_HIDE_CLASS} body,
html.${CURSOR_HIDE_CLASS} body *,
html.${CURSOR_HIDE_CLASS} body *::before,
html.${CURSOR_HIDE_CLASS} body *::after {
  cursor: none !important;
}

.dsh-cursor-halo-layer {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
}

.dsh-cursor-halo-trail-root {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease;
}

.dsh-cursor-halo-trail-root[data-visible="true"] {
  opacity: 1;
}

.dsh-cursor-halo__trail-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dsh-cursor-halo {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2;
  opacity: 0;
  transform: translate3d(-160px, -160px, 0);
  transition: opacity 160ms ease;
  will-change: transform;
  pointer-events: none;
  isolation: isolate;
}

.dsh-cursor-halo[data-visible="true"] {
  opacity: 1;
}

.dsh-cursor-halo__ring,
.dsh-cursor-halo__core {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  border-radius: 50%;
  pointer-events: none;
}

.dsh-cursor-halo__ring-scale {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 1;
  transform-origin: 0 0;
  pointer-events: none;
  will-change: transform;
}

.dsh-cursor-halo__ring {
  z-index: 1;
  width: 88px;
  height: 88px;
  margin: -44px 0 0 -44px;
  background: radial-gradient(
    circle closest-side,
    rgba(77, 107, 254, 0.46) 0%,
    rgba(77, 107, 254, 0.42) 14%,
    rgba(77, 107, 254, 0.32) 30%,
    rgba(77, 107, 254, 0.2) 48%,
    rgba(77, 107, 254, 0.1) 65%,
    rgba(77, 107, 254, 0.035) 82%,
    rgba(77, 107, 254, 0.01) 92%,
    rgba(77, 107, 254, 0) 100%
  );
  transform-origin: 50% 50%;
  animation: dsh-cursor-halo-breathe 6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: transform, opacity;
}

.dsh-cursor-halo__core {
  z-index: 2;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  background: #4d6bfe;
  box-shadow:
    0 0 3px rgba(77, 107, 254, 0.5),
    0 0 7px rgba(77, 107, 254, 0.18);
}

@keyframes dsh-cursor-halo-breathe {
  0%,
  100% {
    transform: scale(0.7);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.12);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-cursor-halo__ring {
    animation: none;
    transform: scale(0.92);
    opacity: 0.85;
  }
}

.dsh-ch-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  color: var(--dsw-alias-label-primary);
}

.dsh-ch-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dsh-ch-title {
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 18px;
  line-height: 26px;
  font-weight: 600;
}

.dsh-ch-intro,
.dsh-ch-desc,
.dsh-ch-footer {
  color: var(--dsw-alias-label-secondary);
}

.dsh-ch-intro {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
}

.dsh-ch-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 8px 16px 4px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
}

.dsh-ch-group-title {
  margin: 8px 0 0;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
}

.dsh-ch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;
  padding: 12px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.dsh-ch-row:last-child {
  border-bottom: 0;
}

.dsh-ch-info {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dsh-ch-label {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  line-height: 22px;
}

.dsh-ch-desc {
  font-size: 12px;
  line-height: 18px;
}

.dsh-ch-control {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
}

.dsh-ch-switch {
  position: relative;
  flex: none;
  width: 38px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}

.dsh-ch-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--dsw-alias-label-secondary);
  transition: transform 160ms ease, background 160ms ease;
}

.dsh-ch-switch[aria-checked="true"] {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-brand-primary);
}

.dsh-ch-switch[aria-checked="true"] .dsh-ch-switch-thumb {
  transform: translateX(16px);
  background: #fff;
}

.dsh-ch-switch:focus-visible,
.dsh-ch-range:focus-visible,
.dsh-ch-reset:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dsh-ch-range {
  width: 168px;
  max-width: 100%;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: pointer;
}

.dsh-ch-value {
  min-width: 64px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.dsh-ch-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  line-height: 18px;
}

.dsh-ch-reset {
  flex: none;
  padding: 6px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  cursor: pointer;
}

.dsh-ch-reset:hover {
  background: var(--dsw-alias-bg-layer-2);
}

@media (max-width: 680px) {
  .dsh-ch-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .dsh-ch-control {
    width: 100%;
    justify-content: flex-end;
  }

  .dsh-ch-range {
    flex: 1 1 auto;
    width: auto;
  }

  .dsh-ch-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
`;

    const React = require("react");
    const ReactDOM = require("react-dom");
    const h = React.createElement;

    function CursorHalo() {
      const markerRef = React.useRef(null);
      const trailRootRef = React.useRef(null);
      const trailCanvasRef = React.useRef(null);
      const ringScaleRef = React.useRef(null);
      const ringRef = React.useRef(null);
      const coreRef = React.useRef(null);

      React.useEffect(() => {
        const marker = markerRef.current;
        const trailRoot = trailRootRef.current;
        const canvas = trailCanvasRef.current;
        const ringScale = ringScaleRef.current;
        const ring = ringRef.current;
        const core = coreRef.current;
        if (
          !marker ||
          !trailRoot ||
          !canvas ||
          !ringScale ||
          !ring ||
          !core ||
          typeof window === "undefined"
        ) {
          return undefined;
        }

        const context = canvas.getContext("2d");
        if (!context) return undefined;

        let visible = false;
        let menuUnderPointer = false;
        let dialogUnderPointer = false;
        let hasTarget = false;
        let targetX = 0;
        let targetY = 0;
        let viewportWidth = 0;
        let viewportHeight = 0;
        let currentSettings = getSettings();
        const trailHistory = [];

        const clearTrail = () => {
          context.clearRect(0, 0, viewportWidth, viewportHeight);
        };

        const resizeCanvas = () => {
          const dpr = Math.max(1, window.devicePixelRatio || 1);
          viewportWidth = window.innerWidth;
          viewportHeight = window.innerHeight;
          canvas.width = Math.round(viewportWidth * dpr);
          canvas.height = Math.round(viewportHeight * dpr);
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          clearTrail();
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const setCursorHidden = (hidden) => {
          document.documentElement.classList.toggle(CURSOR_HIDE_CLASS, hidden);
        };

        // One global switch for every overlay: when enabled the effect steps
        // aside and the native pointer returns on menus, dropdowns, dialogs,
        // and settings. When disabled the effect stays visible on all of them.
        const syncPresentation = () => {
          const shouldHide =
            currentSettings.hideOnMenu &&
            (menuUnderPointer || dialogUnderPointer);
          const shown = visible && !shouldHide;
          const trailShown = shown && currentSettings.trailEnabled;
          marker.dataset.visible = shown ? "true" : "false";
          trailRoot.dataset.visible = trailShown ? "true" : "false";
          setCursorHidden(shown && currentSettings.dotMode);
          if (!shown || !currentSettings.trailEnabled) {
            trailHistory.length = 0;
            clearTrail();
          }
        };

        const setVisible = (next) => {
          if (visible === next) return;
          visible = next;
          syncPresentation();
        };

        const MENU_SELECTOR = [
          '[role="menu"]',
          '[role="menuitem"]',
          '[role="listbox"]',
          '[role="option"]',
          '[aria-haspopup][aria-expanded="true"]',
          '[aria-haspopup][data-state="open"]',
        ].join(",");
        const DIALOG_SELECTOR = [
          '[role="dialog"]',
          '[role="alertdialog"]',
          '[aria-modal="true"]',
          "dialog[open]",
          "[data-radix-popper-content-wrapper]",
          "[data-radix-menu-content]",
          ".dsh-ch-settings",
        ].join(",");

        const overlayStateFor = (node) => ({
          menu: node instanceof Element && node.closest(MENU_SELECTOR) !== null,
          dialog:
            node instanceof Element && node.closest(DIALOG_SELECTOR) !== null,
        });

        const setOverlayUnderPointer = (menu, dialog) => {
          if (menuUnderPointer === menu && dialogUnderPointer === dialog) {
            return;
          }
          menuUnderPointer = menu;
          dialogUnderPointer = dialog;
          syncPresentation();
        };

        let overlayCheckFrame = 0;
        const scheduleOverlayCheck = () => {
          if (overlayCheckFrame) return;
          overlayCheckFrame = window.requestAnimationFrame(() => {
            overlayCheckFrame = 0;
            if (!hasTarget) return;
            const state = overlayStateFor(
              document.elementFromPoint(targetX, targetY),
            );
            setOverlayUnderPointer(state.menu, state.dialog);
          });
        };

        let overlayObserver = null;
        if (typeof MutationObserver !== "undefined" && document.body) {
          overlayObserver = new MutationObserver(scheduleOverlayCheck);
          overlayObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
              "class",
              "hidden",
              "aria-hidden",
              "aria-expanded",
              "aria-haspopup",
              "data-state",
            ],
          });
        }

        const applyVisualSettings = () => {
          currentSettings = getSettings();
          const reducedMotion =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const size = currentSettings.haloSize;

          ringScale.style.display = currentSettings.haloEnabled ? "" : "none";
          core.style.display = currentSettings.dotMode ? "" : "none";
          ring.style.width = size + "px";
          ring.style.height = size + "px";
          ring.style.margin =
            "-" + size / 2 + "px 0 0 -" + size / 2 + "px";
          ring.style.animation =
            currentSettings.breathingEnabled && !reducedMotion
              ? "dsh-cursor-halo-breathe " +
                currentSettings.breathingPeriod +
                "ms cubic-bezier(0.45, 0, 0.55, 1) infinite"
              : "none";

          syncPresentation();
        };
        const unsubscribeSettings = subscribeSettings(applyVisualSettings);
        applyVisualSettings();

        const drawTrail = () => {
          clearTrail();
          if (!hasTarget) return;

          const cutoff = performance.now() - currentSettings.trailDuration;
          while (trailHistory.length && trailHistory[0].t < cutoff) {
            trailHistory.shift();
          }
          if (!trailHistory.length) return;

          const points = trailHistory.map((point) => ({
            x: point.x,
            y: point.y,
          }));
          const last = points[points.length - 1];
          if (Math.hypot(targetX - last.x, targetY - last.y) > 0.2) {
            points.push({ x: targetX, y: targetY });
          } else {
            last.x = targetX;
            last.y = targetY;
          }
          if (points.length < 2) return;

          let pathLength = 0;
          for (let index = 1; index < points.length; index += 1) {
            pathLength += Math.hypot(
              points[index].x - points[index - 1].x,
              points[index].y - points[index - 1].y,
            );
          }
          if (pathLength < 1.5) return;

          const tail = points[0];
          const head = points[points.length - 1];

          context.save();
          context.lineCap = "round";
          context.lineJoin = "round";
          context.beginPath();
          context.moveTo(points[0].x, points[0].y);
          for (let index = 1; index < points.length - 1; index += 1) {
            const next = points[index + 1];
            const midX = (points[index].x + next.x) * 0.5;
            const midY = (points[index].y + next.y) * 0.5;
            context.quadraticCurveTo(
              points[index].x,
              points[index].y,
              midX,
              midY,
            );
          }
          context.lineTo(head.x, head.y);

          const gradient = context.createLinearGradient(
            tail.x,
            tail.y,
            head.x,
            head.y,
          );
          gradient.addColorStop(0, "rgba(77, 107, 254, 0)");
          gradient.addColorStop(0.38, "rgba(77, 107, 254, 0.1)");
          gradient.addColorStop(0.72, "rgba(77, 107, 254, 0.38)");
          gradient.addColorStop(1, "rgba(77, 107, 254, 0.72)");

          // The same continuous path is stroked at three widths: the widest,
          // faintest pass forms the halo, the narrowest pass is the bright core.
          context.globalAlpha = 0.2;
          context.strokeStyle = gradient;
          context.lineWidth = 18;
          context.stroke();

          context.globalAlpha = 0.6;
          context.strokeStyle = gradient;
          context.lineWidth = 9;
          context.stroke();

          context.globalAlpha = 1;
          context.strokeStyle = gradient;
          context.lineWidth = 3.5;
          context.stroke();

          const coreGradient = context.createLinearGradient(
            tail.x,
            tail.y,
            head.x,
            head.y,
          );
          coreGradient.addColorStop(0, "rgba(135, 154, 255, 0)");
          coreGradient.addColorStop(0.45, "rgba(125, 146, 255, 0.18)");
          coreGradient.addColorStop(1, "rgba(160, 174, 255, 0.85)");

          context.globalAlpha = 1;
          context.strokeStyle = coreGradient;
          context.lineWidth = 1.4;
          context.stroke();
          context.restore();
        };

        const place = (event) => {
          // The halo is a mouse/pen affordance; touch input is not a hovering cursor.
          if (event.pointerType === "touch") return;
          targetX = event.clientX;
          targetY = event.clientY;

          // Reset instead of dragging the trail across the gap when the halo reappears.
          if (!hasTarget || !visible) {
            trailHistory.length = 0;
            clearTrail();
          }

          hasTarget = true;
          marker.style.transform =
            "translate3d(" + targetX + "px, " + targetY + "px, 0)";

          const previous = trailHistory[trailHistory.length - 1];
          if (
            !previous ||
            Math.hypot(targetX - previous.x, targetY - previous.y) > 0.2
          ) {
            trailHistory.push({
              x: targetX,
              y: targetY,
              t: performance.now(),
            });
            if (trailHistory.length > TRAIL_MAX_POINTS) trailHistory.shift();
          }

          const overlayState = overlayStateFor(event.target);
          setOverlayUnderPointer(overlayState.menu, overlayState.dialog);
          scheduleOverlayCheck();
          setVisible(true);
        };

        let clickAnimation = null;
        const pulseOnClick = (event) => {
          if (!currentSettings.haloEnabled) return;
          if (event.pointerType === "touch") return;
          if (event.button !== 0) return;
          if (typeof ringScale.animate !== "function") return;
          if (
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ) {
            return;
          }
          if (clickAnimation) clickAnimation.cancel();
          clickAnimation = ringScale.animate(
            [
              { transform: "scale(1)", offset: 0 },
              {
                transform: "scale(" + CLICK_PULSE_SCALE + ")",
                offset: 0.22,
                easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
              },
              { transform: "scale(0.98)", offset: 0.68 },
              { transform: "scale(1)", offset: 1 },
            ],
            {
              duration: CLICK_PULSE_MS,
              easing: "ease-out",
            },
          );
        };

        const hide = () => setVisible(false);
        const onPointerOut = (event) => {
          if (event.relatedTarget === null) hide();
        };
        const onVisibilityChange = () => {
          if (document.visibilityState === "hidden") hide();
        };

        let frameRequest = 0;
        const animate = () => {
          if (
            hasTarget &&
            visible &&
            !(
              currentSettings.hideOnMenu &&
              (menuUnderPointer || dialogUnderPointer)
            ) &&
            currentSettings.trailEnabled
          ) {
            drawTrail();
          } else {
            clearTrail();
          }
          frameRequest = window.requestAnimationFrame(animate);
        };

        window.addEventListener("pointermove", place, { passive: true });
        window.addEventListener("pointerdown", place, { passive: true });
        window.addEventListener("pointerdown", pulseOnClick, { passive: true });
        document.addEventListener("pointerout", onPointerOut, { passive: true });
        window.addEventListener("blur", hide);
        document.addEventListener("visibilitychange", onVisibilityChange);
        frameRequest = window.requestAnimationFrame(animate);

        return () => {
          window.removeEventListener("pointermove", place);
          window.removeEventListener("pointerdown", place);
          window.removeEventListener("pointerdown", pulseOnClick);
          window.removeEventListener("resize", resizeCanvas);
          document.removeEventListener("pointerout", onPointerOut);
          window.removeEventListener("blur", hide);
          document.removeEventListener("visibilitychange", onVisibilityChange);
          window.cancelAnimationFrame(frameRequest);
          if (overlayCheckFrame) window.cancelAnimationFrame(overlayCheckFrame);
          if (overlayObserver) overlayObserver.disconnect();
          if (clickAnimation) clickAnimation.cancel();
          unsubscribeSettings();
          clearTrail();
          document.documentElement.classList.remove(CURSOR_HIDE_CLASS);
        };
      }, []);

      return ReactDOM.createPortal(
        h(
          React.Fragment,
          null,
          h("style", { key: "cursor-halo-style" }, CSS),
          h(
            "div",
            {
              className: "dsh-cursor-halo-layer",
              "aria-hidden": "true",
            },
            h(
              "div",
              {
                ref: trailRootRef,
                className: "dsh-cursor-halo-trail-root",
                "data-visible": "false",
                "aria-hidden": "true",
              },
              h("canvas", {
                ref: trailCanvasRef,
                className: "dsh-cursor-halo__trail-canvas",
                "aria-hidden": "true",
              }),
            ),
            h(
              "div",
              {
                ref: markerRef,
                className: "dsh-cursor-halo",
                "data-visible": "false",
              },
              h(
                "div",
                {
                  ref: ringScaleRef,
                  className: "dsh-cursor-halo__ring-scale",
                  "aria-hidden": "true",
                },
                h("span", {
                  ref: ringRef,
                  className: "dsh-cursor-halo__ring",
                }),
              ),
              h("span", {
                ref: coreRef,
                className: "dsh-cursor-halo__core",
              }),
            ),
          ),
        ),
        document.body,
      );
    }

    function SettingsSwitch({ labelledBy, checked, onChange }) {
      return h(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": checked ? "true" : "false",
          "aria-labelledby": labelledBy,
          className: "dsh-ch-switch",
          onClick: () => onChange(!checked),
        },
        h("span", { className: "dsh-ch-switch-thumb" }),
      );
    }

    function SettingsSlider({
      labelledBy,
      value,
      min,
      max,
      step,
      valueText,
      onChange,
    }) {
      return h(
        React.Fragment,
        null,
        h("input", {
          type: "range",
          className: "dsh-ch-range",
          "aria-labelledby": labelledBy,
          "aria-valuetext": valueText,
          min,
          max,
          step,
          value,
          onChange: (event) => onChange(Number(event.currentTarget.value)),
        }),
        h("span", { className: "dsh-ch-value" }, valueText),
      );
    }

    function CursorHaloSettings({ t, locale }) {
      const [settings, setSettings] = React.useState(getSettings);
      const [, forceLocaleRender] = React.useState(0);
      React.useEffect(() => subscribeSettings(setSettings), []);
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== "function") {
          return undefined;
        }
        return locale.subscribe(() => {
          forceLocaleRender((revision) => revision + 1);
        });
      }, [locale]);

      const idFor = (key) => "dsh-cursor-halo-setting-" + key;
      const row = (key, label, description, control) =>
        h(
          "div",
          { className: "dsh-ch-row", key },
          h(
            "div",
            { className: "dsh-ch-info" },
            h("div", { id: idFor(key), className: "dsh-ch-label" }, label),
            description
              ? h("div", { className: "dsh-ch-desc" }, description)
              : null,
          ),
          h("div", { className: "dsh-ch-control" }, control),
        );
      const toggle = (key) =>
        h(SettingsSwitch, {
          labelledBy: idFor(key),
          checked: settings[key],
          onChange: (value) => updateSettings({ [key]: value }),
        });

      return h(
        React.Fragment,
        null,
        h("style", { key: "cursor-halo-settings-style" }, CSS),
        h(
          "section",
          {
            className: "dsh-ch-settings",
            "aria-labelledby": "dsh-cursor-halo-settings-title",
          },
          h(
            "div",
            { className: "dsh-ch-header" },
            h(
              "h2",
              {
                id: "dsh-cursor-halo-settings-title",
                className: "dsh-ch-title",
              },
              t("title"),
            ),
            h("p", { className: "dsh-ch-intro" }, t("intro")),
          ),
          h(
            "div",
            { className: "dsh-ch-card" },
            h("h3", { className: "dsh-ch-group-title" }, t("pointerGroup")),
            row("dotMode", t("dotMode"), t("dotModeDesc"), toggle("dotMode")),
          row(
            "hideOnMenu",
            t("hideOnMenu"),
            t("hideOnMenuDesc"),
            toggle("hideOnMenu"),
          ),
          ),
          h(
            "div",
            { className: "dsh-ch-card" },
            h("h3", { className: "dsh-ch-group-title" }, t("haloGroup")),
            row(
              "haloEnabled",
              t("haloEnabled"),
              t("haloEnabledDesc"),
              toggle("haloEnabled"),
            ),
            row(
              "haloSize",
              t("haloSize"),
              t("haloSizeDesc"),
              h(SettingsSlider, {
                labelledBy: idFor("haloSize"),
                value: settings.haloSize,
                min: SETTINGS_BOUNDS.haloSize.min,
                max: SETTINGS_BOUNDS.haloSize.max,
                step: 2,
                valueText: settings.haloSize + " " + t("pixels"),
                onChange: (value) => updateSettings({ haloSize: value }),
              }),
            ),
            row(
              "breathingEnabled",
              t("breathingEnabled"),
              t("breathingEnabledDesc"),
              toggle("breathingEnabled"),
            ),
            row(
              "breathingPeriod",
              t("breathingPeriod"),
              t("breathingPeriodDesc"),
              h(SettingsSlider, {
                labelledBy: idFor("breathingPeriod"),
                value: settings.breathingPeriod,
                min: SETTINGS_BOUNDS.breathingPeriod.min,
                max: SETTINGS_BOUNDS.breathingPeriod.max,
                step: 100,
                valueText:
                  (settings.breathingPeriod / 1000).toFixed(1) +
                  " " +
                  t("seconds"),
                onChange: (value) =>
                  updateSettings({ breathingPeriod: value }),
              }),
            ),
          ),
          h(
            "div",
            { className: "dsh-ch-card" },
            h("h3", { className: "dsh-ch-group-title" }, t("trailGroup")),
            row(
              "trailEnabled",
              t("trailEnabled"),
              t("trailEnabledDesc"),
              toggle("trailEnabled"),
            ),
            row(
              "trailDuration",
              t("trailDuration"),
              t("trailDurationDesc"),
              h(SettingsSlider, {
                labelledBy: idFor("trailDuration"),
                value: settings.trailDuration,
                min: SETTINGS_BOUNDS.trailDuration.min,
                max: SETTINGS_BOUNDS.trailDuration.max,
                step: 20,
                valueText: settings.trailDuration + " " + t("milliseconds"),
                onChange: (value) => updateSettings({ trailDuration: value }),
              }),
            ),
          ),
          h(
            "div",
            { className: "dsh-ch-footer" },
            h("span", null, t("autoSave")),
            h(
              "button",
              {
                type: "button",
                className: "dsh-ch-reset",
                onClick: () => resetSettings(),
              },
              t("reset"),
            ),
          ),
        ),
      );
    }

    return {
      inject: ["slots", "locale"],
      apply(ctx) {
        const locale = ctx.locale;
        const registerLocales = () => {
          const disposers = [];
          const hasLanguage = (id) => {
            try {
              const snapshot = locale.getSnapshot?.();
              const languages = Array.isArray(snapshot?.languages)
                ? snapshot.languages
                : Array.isArray(snapshot?.locales)
                  ? snapshot.locales
                  : [];
              return languages.some((entry) => entry && entry.id === id);
            } catch {
              return false;
            }
          };

          for (const pack of LANGUAGE_PACKS) {
            if (hasLanguage(pack.id)) continue;
            try {
              disposers.push(
                locale.addLanguage({
                  id: pack.id,
                  label: pack.label,
                  fallback: "en",
                }),
              );
            } catch (error) {
              console.error(
                "[dsh-cursor-halo] failed to add language " + pack.id + ":",
                error,
              );
            }
          }
          for (const [id, dictionary] of Object.entries(DICTS)) {
            try {
              disposers.push(locale.register(NS, id, dictionary));
            } catch (error) {
              console.error(
                "[dsh-cursor-halo] failed to register " + id + " dictionary:",
                error,
              );
            }
          }

          return () => {
            for (const dispose of disposers.reverse()) {
              try {
                dispose();
              } catch (error) {
                console.error(
                  "[dsh-cursor-halo] locale cleanup failed:",
                  error,
                );
              }
            }
          };
        };
        ctx.effect(registerLocales, "dsh-cursor-halo: locale registration");

        const t = locale.bind(NS);
        const CursorHaloSettingsView = (props) =>
          h(CursorHaloSettings, Object.assign({}, props, { t, locale }));

        ctx.slots.inject("shell.overlay", () =>
          ctx.slots.register(
            {
              name: "shell.overlay",
              id: "dsh-cursor-halo",
              order: 1000,
            },
            CursorHalo,
          ),
        );
        ctx.slots.inject("settings.section", () =>
          ctx.slots.register(
            {
              name: "settings.section",
              id: "dsh-cursor-halo",
              order: 30,
              label: () => t("nav"),
              locale: NS,
            },
            CursorHaloSettingsView,
          ),
        );
      },
    };
  },
});
