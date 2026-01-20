import { Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import GPCSelector from '../GPCSelector/GPCSelector';
import { GPCNode } from '../../../api/ColabriAPI';
import { useTranslation } from 'react-i18next';
import { useGPCNodes } from '../../hooks/useGPC/useGPC';

export type GPCCategoryValue = {
  gpcSegment?: GPCNode;
  gpcFamily?: GPCNode;
  gpcClass?: GPCNode;
  gpcBrick?: GPCNode;
  gpcAttribute?: GPCNode;
  gpcValue?: GPCNode;
};

export type GPCCategorySelectorProps = {
  gpcCategoryValue: GPCCategoryValue;
  showGPCSegment?: boolean;
  showGPCFamily?: boolean;
  showGPCClass?: boolean;
  showGPCBrick?: boolean;
  showGPCAttribute?: boolean;
  showGPCValue?: boolean;
  placeholderGPCSegment?: string;
  placeholderGPCFamily?: string;
  placeholderGPCClass?: string;
  placeholderGPCBrick?: string;
  placeholderGPCAttribute?: string;
  placeholderGPCValue?: string;
  disabled?: boolean;
  onChange?: (
    selectedGpcCategoryValue: GPCCategoryValue,
    field: (keyof GPCCategoryValue)[],
  ) => void;
};

const GPCCategorySelector = (props: GPCCategorySelectorProps) => {
  const { t } = useTranslation();
  const [gpcCategoryValue, setGpcCategoryValue] = useState<GPCCategoryValue>(
    props.gpcCategoryValue,
  );

  let hasMissingDescription = false;
  if (props.showGPCSegment && !gpcCategoryValue.gpcSegment?.description) {
    hasMissingDescription = true;
  }
  if (props.showGPCFamily && !gpcCategoryValue.gpcFamily?.description) {
    hasMissingDescription = true;
  }
  if (props.showGPCClass && !gpcCategoryValue.gpcClass?.description) {
    hasMissingDescription = true;
  }
  if (props.showGPCBrick && !gpcCategoryValue.gpcBrick?.description) {
    hasMissingDescription = true;
  }
  if (props.showGPCAttribute && !gpcCategoryValue.gpcAttribute?.description) {
    hasMissingDescription = true;
  }
  if (props.showGPCValue && !gpcCategoryValue.gpcValue?.description) {
    hasMissingDescription = true;
  }

  gpcCategoryValue.gpcSegment?.code;

  const { nodes } = useGPCNodes({
    queryScope: 'gpcValue',
    gpcSegmentCode: gpcCategoryValue.gpcSegment?.code,
    gpcFamilyCode: gpcCategoryValue.gpcFamily?.code,
    gpcClassCode: gpcCategoryValue.gpcClass?.code,
    gpcBrickCode: gpcCategoryValue.gpcBrick?.code,
    gpcAttributeCode: gpcCategoryValue.gpcAttribute?.code,
    gpcValueCode: gpcCategoryValue.gpcValue?.code,
    queryValue: '',
    limit: 50,
    enabled: hasMissingDescription,
  });

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const gpcNode = nodes[0];

      // Create a new GPCCategoryValue object
      const newGPCValue = {} as GPCCategoryValue;

      // Set the new value of this scope
      if (gpcNode.scope) {
        newGPCValue[gpcNode.scope] = gpcNode;
      }

      // Check if there are parent scopes to set
      const parentScopes: (keyof GPCCategoryValue)[] = [];
      gpcNode?.parentNodes?.forEach((parentNode) => {
        switch (parentNode.scope) {
          case 'gpcSegment':
            newGPCValue.gpcSegment = parentNode;
            parentScopes.push('gpcSegment');
            break;
          case 'gpcFamily':
            newGPCValue.gpcFamily = parentNode;
            parentScopes.push('gpcFamily');
            break;
          case 'gpcClass':
            newGPCValue.gpcClass = parentNode;
            parentScopes.push('gpcClass');
            break;
          case 'gpcBrick':
            newGPCValue.gpcBrick = parentNode;
            parentScopes.push('gpcBrick');
            break;
          case 'gpcAttribute':
            newGPCValue.gpcAttribute = parentNode;
            parentScopes.push('gpcAttribute');
            break;
          case 'gpcValue':
            newGPCValue.gpcValue = parentNode;
            parentScopes.push('gpcValue');
            break;
        }
      });

      // Update the state
      setGpcCategoryValue(newGPCValue);
    }
  }, [nodes]);

  /**
   * When a GPC node is changed
   *
   * @param scope
   * @param node
   */
  const handleGPCChange = (
    scope: keyof GPCCategoryValue,
    node: string | string[] | GPCNode | GPCNode[] | null,
  ) => {
    // First make sure we have a single GPCNode (not multiple)
    let gpcNode: GPCNode | undefined;
    if (Array.isArray(node)) {
      console.log(
        'Array of nodes selected, which is not supported in this context.',
      );
      gpcNode = undefined;
    } else {
      if (node === null) {
        gpcNode = undefined;
      } else if (typeof node === 'object' && 'code' in node) {
        gpcNode = node;
      } else if (typeof node === 'string') {
        console.log('String selected, which is not supported in this context.');
        gpcNode = undefined;
      }
    }

    // Update the state
    setGpcCategoryValue((prev) => {
      // If a node is selected
      if (gpcNode) {
        // Create a new GPCCategoryValue object
        const newGPCValue = {} as GPCCategoryValue;

        // Set the new value of this scope
        newGPCValue[scope] = gpcNode;

        // Check if there are parent scopes to set
        const parentScopes: (keyof GPCCategoryValue)[] = [];
        gpcNode?.parentNodes?.forEach((parentNode) => {
          switch (parentNode.scope) {
            case 'gpcSegment':
              newGPCValue.gpcSegment = parentNode;
              parentScopes.push('gpcSegment');
              break;
            case 'gpcFamily':
              newGPCValue.gpcFamily = parentNode;
              parentScopes.push('gpcFamily');
              break;
            case 'gpcClass':
              newGPCValue.gpcClass = parentNode;
              parentScopes.push('gpcClass');
              break;
            case 'gpcBrick':
              newGPCValue.gpcBrick = parentNode;
              parentScopes.push('gpcBrick');
              break;
            case 'gpcAttribute':
              newGPCValue.gpcAttribute = parentNode;
              parentScopes.push('gpcAttribute');
              break;
            case 'gpcValue':
              newGPCValue.gpcValue = parentNode;
              parentScopes.push('gpcValue');
              break;
          }
        });

        props.onChange?.(newGPCValue, [scope, ...parentScopes]);

        // Set the new value
        return newGPCValue;
      }
      // If no node is selected, clear this scope and all child scopes
      else {
        // Create a new GPCCategoryValue object
        const newGPCValue = { ...prev };

        // Clear this scope and all child scopes
        const parentScopes: (keyof GPCCategoryValue)[] = [];
        switch (scope) {
          case 'gpcSegment':
            newGPCValue.gpcSegment = undefined;
            newGPCValue.gpcFamily = undefined;
            newGPCValue.gpcClass = undefined;
            newGPCValue.gpcBrick = undefined;
            newGPCValue.gpcAttribute = undefined;
            newGPCValue.gpcValue = undefined;
            props.showGPCSegment && parentScopes.push('gpcSegment');
            props.showGPCFamily && parentScopes.push('gpcFamily');
            props.showGPCClass && parentScopes.push('gpcClass');
            props.showGPCBrick && parentScopes.push('gpcBrick');
            props.showGPCAttribute && parentScopes.push('gpcAttribute');
            props.showGPCValue && parentScopes.push('gpcValue');
            break;
          case 'gpcFamily':
            newGPCValue.gpcFamily = undefined;
            newGPCValue.gpcClass = undefined;
            newGPCValue.gpcBrick = undefined;
            newGPCValue.gpcAttribute = undefined;
            newGPCValue.gpcValue = undefined;
            props.showGPCFamily && parentScopes.push('gpcFamily');
            props.showGPCClass && parentScopes.push('gpcClass');
            props.showGPCBrick && parentScopes.push('gpcBrick');
            props.showGPCAttribute && parentScopes.push('gpcAttribute');
            props.showGPCValue && parentScopes.push('gpcValue');
            break;
          case 'gpcClass':
            newGPCValue.gpcClass = undefined;
            newGPCValue.gpcBrick = undefined;
            newGPCValue.gpcAttribute = undefined;
            newGPCValue.gpcValue = undefined;
            props.showGPCClass && parentScopes.push('gpcClass');
            props.showGPCBrick && parentScopes.push('gpcBrick');
            props.showGPCAttribute && parentScopes.push('gpcAttribute');
            props.showGPCValue && parentScopes.push('gpcValue');
            break;
          case 'gpcBrick':
            newGPCValue.gpcBrick = undefined;
            newGPCValue.gpcAttribute = undefined;
            newGPCValue.gpcValue = undefined;
            props.showGPCBrick && parentScopes.push('gpcBrick');
            props.showGPCAttribute && parentScopes.push('gpcAttribute');
            props.showGPCValue && parentScopes.push('gpcValue');
            break;
          case 'gpcAttribute':
            newGPCValue.gpcAttribute = undefined;
            newGPCValue.gpcValue = undefined;
            props.showGPCAttribute && parentScopes.push('gpcAttribute');
            props.showGPCValue && parentScopes.push('gpcValue');
            break;
          case 'gpcValue':
            newGPCValue.gpcValue = undefined;
            props.showGPCValue && parentScopes.push('gpcValue');
            break;
        }

        props.onChange?.(newGPCValue, [...parentScopes]);

        return newGPCValue;
      }
    });
  };

  return (
    <Stack spacing={4} width="100%">
      {props.showGPCSegment && (
        <GPCSelector
          value={gpcCategoryValue.gpcSegment}
          gpcScope="gpcSegment"
          onChange={(node) => handleGPCChange('gpcSegment', node)}
          label={t('gpc.name.segment')}
          disabled={props.disabled}
          placeholder={props.placeholderGPCSegment}
        />
      )}
      {props.showGPCFamily && (
        <GPCSelector
          gpcScope="gpcFamily"
          value={gpcCategoryValue.gpcFamily}
          gpcSegmentCode={gpcCategoryValue.gpcSegment?.code}
          onChange={(node) => handleGPCChange('gpcFamily', node)}
          label={t('gpc.name.family')}
          disabled={props.disabled}
          placeholder={props.placeholderGPCFamily}
        />
      )}
      {props.showGPCClass && (
        <GPCSelector
          gpcScope="gpcClass"
          value={gpcCategoryValue.gpcClass}
          gpcSegmentCode={gpcCategoryValue.gpcSegment?.code}
          gpcFamilyCode={gpcCategoryValue.gpcFamily?.code}
          onChange={(node) => handleGPCChange('gpcClass', node)}
          label={t('gpc.name.class')}
          disabled={props.disabled}
          placeholder={props.placeholderGPCClass}
        />
      )}
      {props.showGPCBrick && (
        <GPCSelector
          gpcScope="gpcBrick"
          value={gpcCategoryValue.gpcBrick}
          gpcSegmentCode={gpcCategoryValue.gpcSegment?.code}
          gpcFamilyCode={gpcCategoryValue.gpcFamily?.code}
          gpcClassCode={gpcCategoryValue.gpcClass?.code}
          onChange={(node) => handleGPCChange('gpcBrick', node)}
          label={t('gpc.name.brick')}
          disabled={props.disabled}
          placeholder={props.placeholderGPCBrick}
        />
      )}
      {props.showGPCAttribute && (
        <GPCSelector
          gpcScope="gpcAttribute"
          value={gpcCategoryValue.gpcAttribute}
          gpcSegmentCode={gpcCategoryValue.gpcSegment?.code}
          gpcFamilyCode={gpcCategoryValue.gpcFamily?.code}
          gpcClassCode={gpcCategoryValue.gpcClass?.code}
          onChange={(node) => handleGPCChange('gpcAttribute', node)}
          label={t('gpc.name.attribute')}
          disabled={props.disabled}
          placeholder={props.placeholderGPCAttribute}
        />
      )}
    </Stack>
  );
};

export default GPCCategorySelector;
