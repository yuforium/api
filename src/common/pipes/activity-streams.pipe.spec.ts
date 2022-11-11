import { ActivityStreams } from '@yuforium/activity-streams';
import { ActivityStreamsPipe } from './activity-streams.pipe';

describe('ActivityStreamsPipe', () => {
  it('should be defined', () => {
    expect(new ActivityStreamsPipe(new ActivityStreams.Transformer())).toBeDefined();
  });
});
