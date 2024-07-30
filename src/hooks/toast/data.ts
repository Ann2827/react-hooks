import { DataI, ToastDataObject, ToastSettingsI, TToastTranslationFn } from './toast.types';

const initialTranslationFn: TToastTranslationFn = (key, _options) => key;

export const initialSettings: ToastSettingsI = {
  sticky: false,
  duration: 3000,
  duplicate: true,
  limit: undefined,
  types: {
    error: {
      title: '',
      icon: '',
      console: true,
      color: '',
    },
    warning: {
      title: '',
      icon: '',
      console: true,
      color: '',
    },
    info: {
      title: '',
      icon: '',
      console: false,
      color: '',
    },
    success: {
      title: '',
      icon: '',
      console: false,
      color: '',
    },
  },
};

export const data: DataI = {
  _listeners: [],
  _lastID: 0,
  _timeouts: [],
  _settings: { ...initialSettings },
  data: [],
  _event(e) {
    this._listeners.forEach((listener) => listener(e));
  },
  _translationFn: initialTranslationFn,
  _workWithOptions(options) {
    if (!options) return;
    return Object.fromEntries(
      Object.entries(options).map(([key, value]) => {
        if (typeof value === 'function') return [key, value(this._translationFn)];
        return [key, value];
      }),
    );
  },
  _updateAlerts() {
    if (this.data.length > 0) {
      for (let i = 0; i < this.data.length; i++) {
        const titleData = this.data[i].titleData;
        if (typeof titleData === 'object') {
          this.data[i].title = this._translationFn(titleData.key, this._workWithOptions(titleData.options));
        }
        const textData = this.data[i].textData;
        if (typeof textData === 'object') {
          this.data[i].text = this._translationFn(textData.key, this._workWithOptions(textData.options));
        }
        const actions = this.data[i].actions;
        if (actions && actions.length > 0) {
          for (let j = 0; j < actions.length; j++) {
            const actionData = actions[j].actionData;
            if (typeof actionData === 'object') {
              this.data[i].actions![j].text = this._translationFn(
                actionData.key,
                this._workWithOptions(actionData.options),
              );
            }
          }
        }
      }
      this._event(this.data);
    }
  },
  setTranslationFn(fn) {
    this._translationFn = fn;
    this._updateAlerts();
  },
  updateSettings(props) {
    this._settings = {
      sticky: props.sticky ?? this._settings.sticky,
      duration: props.duration ?? this._settings.duration,
      duplicate: props.duplicate ?? this._settings.duplicate,
      limit: props.limit ?? this._settings.limit,
      types: {
        error: { ...this._settings.types.error, ...props.types?.error },
        warning: { ...this._settings.types.warning, ...props.types?.warning },
        info: { ...this._settings.types.info, ...props.types?.info },
        success: { ...this._settings.types.success, ...props.types?.success },
      },
    };
    // TODO: использовать
    // this.updateAlerts();
    if (this.data.length > 0) {
      for (let i = 0; i < this.data.length; i++) {
        const type = this.data[i].type;
        this.data[i].icon = this._settings.types[type].icon;
        this.data[i].title = this._settings.types[type].title;
        this.data[i].color = this._settings.types[type].color;
      }
      this._event(this.data);
    }
  },
  activate({ text, type, duration, sticky, title, actions, tag, titleData, textData, group }) {
    if (!this._settings.duplicate && tag && this.data.some((item) => item.tag === tag)) {
      return;
    }

    this._lastID += 1;
    const id = this._lastID;
    const alertTitle = titleData
      ? this._translationFn(titleData.key, this._workWithOptions(titleData.options))
      : (title ?? this._settings.types[type].title);
    const alertText = textData ? this._translationFn(textData.key, this._workWithOptions(textData.options)) : text;
    const updated: ToastDataObject = {
      text: alertText,
      type,
      id,
      title: alertTitle,
      actions: actions?.map((item) => {
        const alertAction = item.actionData
          ? this._translationFn(item.actionData.key, this._workWithOptions(item.actionData.options))
          : item.text;
        return {
          text: alertAction,
          actionData: item.actionData,
          action: () => {
            item.action();
            this.determinate(id);
          },
        };
      }),
      tag,
      group,
      icon: this._settings.types[type].icon,
      color: this._settings.types[type].color,
      titleDefault: !title,
      titleData,
      textData,
    };
    this.data.push(updated);

    const time = duration ?? this._settings.duration;
    if (!(sticky ?? this._settings.sticky) && time) {
      const timeout = setTimeout(() => {
        this.determinate(id);
        this._timeouts = this._timeouts.filter((item) => item.id !== id);
      }, time);
      this._timeouts.push({ id, clear: timeout, group });
    }

    if (this._settings.limit) {
      this._event(this.data.slice(-this._settings.limit));
    } else this._event(this.data);
  },
  determinate(idOrGroup) {
    let updated: ToastDataObject[] = [];
    let timeouts: DataI['_timeouts'] = [];

    if (idOrGroup && typeof idOrGroup === 'number') {
      updated = this.data.filter((item) => item.id !== idOrGroup);
      const timeout = this._timeouts.find((item) => item.id === idOrGroup);
      if (timeout) clearTimeout(timeout.clear);
      timeouts = this._timeouts.filter((item) => item.id !== idOrGroup);
    }

    if (idOrGroup && typeof idOrGroup === 'string') {
      updated = this.data.filter((item) => item.group !== idOrGroup);
      const timeout = this._timeouts.find((item) => item.group === idOrGroup);
      if (timeout) clearTimeout(timeout.clear);
      timeouts = this._timeouts.filter((item) => item.group !== idOrGroup);
    }

    this.data = updated;
    this._timeouts = timeouts;

    if (this._settings.limit) {
      this._event(updated.slice(-this._settings.limit));
    } else this._event(updated);
  },
  getData() {
    return this.data;
  },
  on(fn) {
    this._listeners.push(fn);
    return () => (this._listeners = this._listeners.filter((listener) => listener !== fn));
  },
  console(type) {
    return this._settings.types[type].console;
  },
  reset() {
    this._lastID = 0;
    this.data = [];
    this._timeouts = [];
    this._settings = { ...initialSettings };
    this._event = (_data) => {};
    this._translationFn = initialTranslationFn;
  },
};
