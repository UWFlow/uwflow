# Modals

## Using Modals

The `useModal` hook will provide `openModal` and `closeModal` functions that can be used in your component.

- `openModal(MODAL_NAME, props)` opens a modal with the provided props
- `closeModal(MODAL_NAME)` closes the modal
- `onRequestClose` is automatically provided to the modal as a prop, defaults to just closing the modal but can be overridden
- `onAfterClose` can be set from propas well

## Making Modals

1. Make a modal content component
2. Add a new modal name constant under `constants/modal`
3. Add the modal to the modal name map in `components/modal/ModalUtils`

## Notes

The modal controller component was designed so that every component can only open one of each modal. This will need to be changed if a component ever needs to open more than one of the same modal.
