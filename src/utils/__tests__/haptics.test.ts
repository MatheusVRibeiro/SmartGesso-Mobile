import { haptics } from '../haptics';
import { Vibration } from 'react-native';

describe('haptics', () => {
  beforeEach(() => {
    jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('chama Vibration.vibrate em selection()', () => {
    haptics.selection();
    expect(Vibration.vibrate).toHaveBeenCalled();
  });

  it('chama Vibration.vibrate em impact()', () => {
    haptics.impact();
    expect(Vibration.vibrate).toHaveBeenCalled();
  });

  it('chama Vibration.vibrate em success()', () => {
    haptics.success();
    expect(Vibration.vibrate).toHaveBeenCalled();
  });

  it('chama Vibration.vibrate em warning()', () => {
    haptics.warning();
    expect(Vibration.vibrate).toHaveBeenCalled();
  });
});
