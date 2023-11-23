import Environment from '../helpers/Environment';
import SdkEnvironment from '../managers/SdkEnvironment';
import Utils from '../context/Utils';
import Log from '../libraries/Log';

const SILENT_EVENTS = [
  'notifyButtonHovering',
  'notifyButtonHover',

  'notifyButtonButtonClick',
  'notifyButtonLauncherClick',
  'animatedElementHiding',
  'animatedElementHidden',
  'animatedElementShowing',
  'animatedElementShown',
  'activeAnimatedElementActivating',
  'activeAnimatedElementActive',
  'activeAnimatedElementInactivating',
  'activeAnimatedElementInactive',
  'dbRetrieved',
  'dbSet',
  'testEvent',
];

const LEGACY_EVENT_MAP: { [key: string]: string } = {
  permissionChange: 'onesignal.prompt.native.permissionchanged',
  subscriptionChange: 'onesignal.subscription.changed',
  customPromptClick: 'onesignal.prompt.custom.clicked',
};

export default class OneSignalEvent {
  /**
   * Triggers the specified event with optional custom data.
   * @param eventName The string event name to be emitted.
   * @param data Any JavaScript variable to be passed with the event.
   */
  static async trigger(eventName: string, data?: any) {
    if (!Utils.contains(SILENT_EVENTS, eventName)) {
      const displayData = data;
      let env = Utils.capitalize(SdkEnvironment.getWindowEnv().toString());

      if (displayData || displayData === false) {
        Log.debug(`(${env}) » ${eventName}:`, displayData);
      } else {
        Log.debug(`(${env}) » ${eventName}`);
      }
    }

    // Actually fire the event that can be listened to via OneSignal.on()
    if (Environment.isBrowser()) {
      if (eventName === OneSignal.EVENTS.SDK_INITIALIZED) {
        if (OneSignal.initialized) return;
        else OneSignal.initialized = true;
      }
      await OneSignal.emitter.emit(eventName, data);
    }
    // eslint-disable-next-line no-prototype-builtins
    if (LEGACY_EVENT_MAP.hasOwnProperty(eventName)) {
      const legacyEventName = LEGACY_EVENT_MAP[eventName];
      OneSignalEvent._triggerLegacy(legacyEventName, data);
    }
  }

  /**
   * Fires the event to be listened to via window.addEventListener().
   * @param eventName The string event name.
   * @param data Any JavaScript variable to be passed with the event.
   * @private
   */
  static _triggerLegacy(eventName: string, data: any) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: data,
    });
    // Fire the event that listeners can listen to via 'window.addEventListener()'
    window.dispatchEvent(event);
  }
}
