import React, { useEffect, useState } from 'react';
import {
  GetHandleProps,
  GetTrackProps,
  Handles,
  Rail,
  Slider,
  SliderItem,
  Tracks,
} from 'react-compound-slider';
import { useTheme } from 'styled-components';

import {
  DiscreteSliderWrapper,
  SliderBarWrapper,
  SliderHandle,
  SliderRail,
  SliderTick,
  SliderTrack,
} from './styles/DiscreteSlider';

type HandleProps = {
  color: string;
  disabled: boolean;
  getHandleProps: GetHandleProps;
  handle: SliderItem;
};

const Handle = ({ color, disabled, getHandleProps, handle }: HandleProps) => (
  <SliderHandle
    percent={handle.percent}
    color={color}
    disabled={disabled}
    {...getHandleProps(handle.id)}
  />
);

type TrackProps = {
  color: string;
  disabled: boolean;
  getTrackProps: GetTrackProps;
  source: SliderItem;
  target: SliderItem;
};

const Track = ({
  source,
  target,
  color,
  getTrackProps,
  disabled,
}: TrackProps) => (
  <SliderTrack
    target={target}
    source={source}
    color={color}
    disabled={disabled}
    {...getTrackProps()}
  />
);

type DiscreteSliderProps = {
  color: string;
  currentNode: number;
  numNodes: number;
  disabled?: boolean;
  fullWidthMobile?: boolean;
  margin?: string;
  // Divides into numNodes including 0, for example 6 for [0 20 40 60 80 100]
  onSlideEnd?: (values: readonly number[]) => void;
  onUpdate?: (values: readonly number[]) => void;
  selected?: boolean;
  setSelected?: (selected: boolean) => void;
  showTicks?: boolean;
};

const DiscreteSlider = ({
  color,
  currentNode,
  numNodes,
  margin = '0 0 40px 0',
  showTicks = true,
  selected = true,
  fullWidthMobile = false,
  disabled = false,
  onSlideEnd = () => {},
  onUpdate = () => {},
  setSelected = () => {},
}: DiscreteSliderProps) => {
  const theme = useTheme();
  const [updateValue, setUpdateValue] = useState(currentNode);

  useEffect(() => {
    setUpdateValue(currentNode);
  }, [currentNode]);

  const percentGap = numNodes > 1 ? 100 / (numNodes - 1) : 100;
  const percentages: number[] = [];
  for (let i = 0; i < 100; i += percentGap) {
    percentages.push(i);
  }
  percentages.push(100);

  return (
    <DiscreteSliderWrapper margin={margin} fullWidthMobile={fullWidthMobile}>
      <SliderBarWrapper>
        <Slider
          step={1}
          mode={2}
          domain={[0, numNodes - 1]}
          disabled={disabled}
          onSlideEnd={(values) => {
            if (disabled) {
              return;
            }
            onSlideEnd(values);
          }}
          onUpdate={(values) => {
            if (disabled) {
              return;
            }
            const newVal = values[0];
            setUpdateValue(newVal);
            onUpdate(values);
          }}
          values={[currentNode]}
          rootStyle={{
            position: 'relative',
            width: '100%',
            height: '8px',
            marginRight: '12px',
            marginLeft: '12px',
          }}
        >
          <Rail>
            {({ getRailProps }) => (
              <>
                <SliderRail {...getRailProps()} disabled={disabled} />
                {showTicks &&
                  percentages.map((percent, idx) => (
                    <SliderTick
                      key={percent}
                      color={idx <= updateValue ? color : theme.light3}
                      percent={percent}
                      disabled={disabled}
                      {...getRailProps()}
                    />
                  ))}
              </>
            )}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div
                className="slider-handles"
                onClick={() => {
                  if (!selected && !disabled) {
                    setSelected(true);
                  }
                }}
              >
                {handles.map((handle) => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    getHandleProps={getHandleProps}
                    color={selected ? color : theme.light3}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    color={color}
                    getTrackProps={getTrackProps}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}
          </Tracks>
        </Slider>
      </SliderBarWrapper>
    </DiscreteSliderWrapper>
  );
};

export default DiscreteSlider;
