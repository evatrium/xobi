import { useCallback, useEffect, useState, useRef } from 'preact/hooks';
import { createXobi } from './createXobi';
import { withUseHook } from './withUseHook';
export const xobi = withUseHook(
  createXobi,
  useCallback,
  useEffect,
  useRef,
  useState
);
export default xobi;