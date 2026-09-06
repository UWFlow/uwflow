import React from 'react';
import { Plus } from 'react-feather';
import { useTheme } from 'styled-components';

import DropdownList from 'components/input/DropdownList';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from 'components/ui/card';
import { CircularProgress } from 'components/ui/circular-progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'components/ui/collapsible';
import { FileUpload, PasteBox } from 'components/ui/data-upload';
import {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/ui/dialog';
import { FilterChip } from 'components/ui/filter-chip';
import { Input } from 'components/ui/input';
import { Link } from 'components/ui/link';
import { Progress } from 'components/ui/progress';
import { Radio, RadioGroup } from 'components/ui/radio-group';
import { Separator } from 'components/ui/separator';
import { Slider } from 'components/ui/slider';
import { Spinner } from 'components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { Textarea } from 'components/ui/textarea';
import { ThumbToggle } from 'components/ui/thumb-toggle';
import { Tooltip } from 'components/ui/tooltip';
import { Heading, Text } from 'components/ui/typography';

import { Example, ExampleGroup, Section } from './Showcase';

const titleCase = (value: string) =>
  value
    .split('-')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');

export const Buttons = () => (
  <Section title="Button">
    <ExampleGroup title="Variants">
      {(['default', 'filter', 'neutral', 'destructive', 'link'] as const).map(
        (variant) => (
          <Example key={variant} label={titleCase(variant)}>
            <Button variant={variant}>Button</Button>
          </Example>
        ),
      )}
    </ExampleGroup>
    <ExampleGroup title="Sizes">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Example key={size} label={titleCase(size)}>
          <Button size={size}>Button</Button>
        </Example>
      ))}
      <Example label="Icon">
        <Button aria-label="Add" size="icon">
          <Plus size={18} />
        </Button>
      </Example>
    </ExampleGroup>
  </Section>
);

export const Links = () => (
  <Section title="Link">
    <ExampleGroup title="Semantics">
      <Example label="Primary">
        <Link href="#links">Primary Link</Link>
      </Example>
      <Example label="Course">
        <Link tone="course" href="#links">
          Course Link
        </Link>
      </Example>
      <Example label="Professor">
        <Link tone="professor" href="#links">
          Professor Link
        </Link>
      </Example>
    </ExampleGroup>
  </Section>
);

export const Inputs = () => (
  <Section title="Input">
    <ExampleGroup title="States">
      <Example label="Default">
        <Input aria-label="Email" placeholder="Email" type="email" />
      </Example>
      <Example label="Filled">
        <Input
          aria-label="Filled Email"
          defaultValue="hello@uwaterloo.ca"
          type="email"
        />
      </Example>
      <Example label="Error">
        <Input
          aria-label="Email Error"
          defaultValue="Invalid Email"
          state="error"
          type="email"
        />
      </Example>
    </ExampleGroup>
  </Section>
);

export const Textareas = () => (
  <Section title="Textarea">
    <ExampleGroup title="States">
      <Example label="Comment">
        <Textarea
          aria-label="Review Comment"
          placeholder="Add Any Comments Or Tips..."
        />
      </Example>
      <Example label="Error">
        <Textarea
          aria-label="Error textarea"
          defaultValue="Error"
          state="error"
        />
      </Example>
    </ExampleGroup>
  </Section>
);

export const DataUploads = () => {
  const [schedule, setSchedule] = React.useState('');
  return (
    <Section title="Data Upload">
      <ExampleGroup className="grid-cols-1" title="Import">
        <Example label="Transcript File">
          <FileUpload />
        </Example>
        <Example label="Schedule Paste">
          <PasteBox
            aria-label="Paste Schedule"
            onChange={(event) => setSchedule(event.target.value)}
            value={schedule}
          />
        </Example>
      </ExampleGroup>
    </Section>
  );
};

export const Radios = () => (
  <Section title="Radio">
    <ExampleGroup title="Group">
      <Example>
        <RadioGroup className="flex gap-md">
          <label className="flex items-center gap-sm font-inter text-md font-semibold text-dark2">
            <Radio defaultChecked name="demo" value="current" />
            This Term
          </label>
          <label className="flex items-center gap-sm font-inter text-md font-semibold text-dark2">
            <Radio name="demo" value="next" />
            Next Term
          </label>
          <label className="flex items-center gap-sm font-inter text-md font-semibold text-dark2">
            <Radio disabled name="demo" value="disabled" />
            Disabled
          </label>
        </RadioGroup>
      </Example>
    </ExampleGroup>
  </Section>
);

export const Selects = () => {
  const theme = useTheme();
  const [course, setCourse] = React.useState(-1);
  const [professor, setProfessor] = React.useState(-1);
  return (
    <Section title="Select">
      <ExampleGroup title="Semantics">
        <Example label="Course">
          <DropdownList
            color={theme.courses}
            onChange={setCourse}
            options={['CS 135', 'CS 136', 'CS 246']}
            placeholder="Select Course"
            selectedIndex={course}
          />
        </Example>
        <Example label="Professor">
          <DropdownList
            color={theme.professors}
            onChange={setProfessor}
            options={['Ada Lovelace', 'Alan Turing', 'Grace Hopper']}
            placeholder="Select Professor"
            selectedIndex={professor}
          />
        </Example>
      </ExampleGroup>
    </Section>
  );
};

export const Sliders = () => (
  <Section title="Slider">
    <ExampleGroup title="States">
      <Example label="Default">
        <Slider aria-label="Value" defaultValue={40} />
      </Example>
      <Example label="Stepped">
        <Slider
          aria-label="Stepped Value"
          defaultValue={2}
          max={4}
          min={0}
          showSteps
          step={1}
        />
      </Example>
      <Example label="Course">
        <Slider
          aria-label="Course Value"
          color="course"
          defaultValue={2}
          max={4}
          showSteps
        />
      </Example>
      <Example label="Professor">
        <Slider
          aria-label="Professor Value"
          color="professor"
          defaultValue={3}
          max={4}
          showSteps
        />
      </Example>
    </ExampleGroup>
  </Section>
);

export const FilterChips = () => {
  const labels = ['1XX', '2XX', '3XX', '4XX', '6XX+'];
  const [selected, setSelected] = React.useState(() => new Set(['1XX']));

  return (
    <Section title="Filter Chip">
      <ExampleGroup title="Course Codes">
        <Example label="Toggleable">
          <div className="flex flex-wrap gap-sm">
            {labels.map((label) => (
              <FilterChip
                key={label}
                selected={selected.has(label)}
                onClick={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(label)) next.delete(label);
                    else next.add(label);
                    return next;
                  })
                }
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </Example>
      </ExampleGroup>
    </Section>
  );
};

export const CircularProgresses = () => (
  <Section title="Circular Progress">
    <ExampleGroup title="Review Percentage">
      <Example label="Positive">
        <CircularProgress label="Liked It" value={43} />
      </Example>
      <Example label="Unavailable">
        <CircularProgress label="Liked" value={null} />
      </Example>
    </ExampleGroup>
  </Section>
);

export const ThumbToggles = () => (
  <Section title="Thumb Toggle">
    <ExampleGroup title="States">
      <Example label="Unselected">
        <ThumbToggle />
      </Example>
      <Example label="Thumbs Up">
        <ThumbToggle defaultValue="up" />
      </Example>
      <Example label="Thumbs Down">
        <ThumbToggle defaultValue="down" />
      </Example>
      <Example label="Course">
        <ThumbToggle color="course" defaultValue="up" />
      </Example>
      <Example label="Professor">
        <ThumbToggle color="professor" defaultValue="down" />
      </Example>
    </ExampleGroup>
  </Section>
);

export const Badges = () => (
  <Section title="Badge">
    <ExampleGroup title="Variants">
      {(
        [
          'default',
          'primary',
          'course',
          'professor',
          'danger',
          'outline',
        ] as const
      ).map((variant) => (
        <Example key={variant} label={titleCase(variant)}>
          <Badge variant={variant}>Badge</Badge>
        </Example>
      ))}
    </ExampleGroup>
  </Section>
);

export const Cards = () => (
  <Section title="Card">
    <ExampleGroup title="Default">
      <Example>
        <Card className="w-full">
          <CardHeader>
            <Heading size="lg">Card</Heading>
          </CardHeader>
          <CardContent>
            <Text tone="muted">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              posuere erat a ante venenatis dapibus posuere velit aliquet.
            </Text>
          </CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </Example>
    </ExampleGroup>
  </Section>
);

export const Feedback = () => (
  <>
    <Section title="Spinner">
      <ExampleGroup title="Sizes">
        <Example label="Small">
          <Spinner size="sm" />
        </Example>
        <Example label="Medium">
          <Spinner />
        </Example>
        <Example label="Large">
          <Spinner size="lg" />
        </Example>
      </ExampleGroup>
    </Section>
    <Section title="Progress">
      <ExampleGroup title="Review Metrics">
        <Example label="Useful">
          <div className="flex w-full items-center gap-md">
            <Progress value={46} />
            <span className="font-anderson text-lg font-semibold text-dark1">
              46%
            </span>
          </div>
        </Example>
        <Example label="Easy">
          <div className="flex w-full items-center gap-md">
            <Progress value={13} />
            <span className="font-anderson text-lg font-semibold text-dark1">
              13%
            </span>
          </div>
        </Example>
        <Example label="Complete">
          <div className="flex w-full items-center gap-md">
            <Progress value={100} />
            <span className="font-anderson text-lg font-semibold text-dark1">
              100%
            </span>
          </div>
        </Example>
      </ExampleGroup>
    </Section>
    <Section title="Separator">
      <ExampleGroup title="Orientation">
        <Example label="Horizontal">
          <Separator className="w-full" />
        </Example>
        <Example label="Vertical">
          <Separator className="h-16" orientation="vertical" />
        </Example>
      </ExampleGroup>
    </Section>
  </>
);

export const Disclosure = () => (
  <>
    <Section title="Tabs">
      <ExampleGroup title="Default">
        <Example>
          <div className="w-full rounded-card bg-light1 p-sm">
            <Tabs className="w-full" defaultValue="courses">
              <TabsList>
                <TabsTrigger value="courses">Spring 2019</TabsTrigger>
                <TabsTrigger value="professors">Fall 2019</TabsTrigger>
              </TabsList>
              <TabsContent value="courses">
                <div className="h-16 bg-white" />
              </TabsContent>
              <TabsContent value="professors">
                <div className="h-16 bg-white" />
              </TabsContent>
            </Tabs>
          </div>
        </Example>
      </ExampleGroup>
    </Section>
    <Section title="Collapsible">
      <ExampleGroup title="Default">
        <Example>
          <Collapsible className="w-full">
            <CollapsibleTrigger>Details</CollapsibleTrigger>
            <CollapsibleContent>
              <Text tone="muted">Expanded</Text>
            </CollapsibleContent>
          </Collapsible>
        </Example>
      </ExampleGroup>
    </Section>
  </>
);

export const Overlays = () => {
  return (
    <>
      <Section title="Tooltip">
        <ExampleGroup title="Default">
          <Example>
            <Tooltip content="Tooltip">
              <Button>Hover</Button>
            </Tooltip>
          </Example>
        </ExampleGroup>
      </Section>
      <Section title="Dialog">
        <ExampleGroup title="Default">
          <Example>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open</Button>
              </DialogTrigger>
              <DialogContent ariaLabel="Example dialog">
                <DialogCloseButton />
                <DialogHeader>
                  <DialogTitle>Dialog</DialogTitle>
                  <DialogDescription>Description</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="neutral">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>Confirm</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Example>
        </ExampleGroup>
      </Section>
    </>
  );
};

export const Tables = () => (
  <Section title="Table">
    <ExampleGroup title="Schedule">
      <Example label="Semantic Side Bars">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Section</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow sideBar="dark">
              <TableCell className="font-semibold">LEC 101</TableCell>
              <TableCell>2292</TableCell>
              <TableCell className="font-medium text-red">130 / 140</TableCell>
              <TableCell>1:30 PM – 2:20 PM</TableCell>
              <TableCell>E7 5343</TableCell>
            </TableRow>
            <TableRow sideBar="medium">
              <TableCell className="font-semibold">LAB 201</TableCell>
              <TableCell>3000</TableCell>
              <TableCell className="font-medium text-red">46 / 46</TableCell>
              <TableCell>8:30 AM – 11:20 AM</TableCell>
              <TableCell>E7 5343</TableCell>
            </TableRow>
            <TableRow sideBar="light">
              <TableCell className="font-semibold">TUT 101</TableCell>
              <TableCell>2997</TableCell>
              <TableCell>42 / 47</TableCell>
              <TableCell>8:30 AM – 10:20 AM</TableCell>
              <TableCell>EV3 1408</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Example>
    </ExampleGroup>
  </Section>
);
