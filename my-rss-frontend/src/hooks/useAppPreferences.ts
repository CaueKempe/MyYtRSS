import { useState, useEffect } from 'react';
import { usePreferences } from './usePreferences';
import type { ListDensity, GridDensity } from '../components/layout/Header';

export function useAppPreferences() {
  const { preferences: savedViewMode, savePreferences: saveViewMode } = usePreferences<'grid' | 'list' | 'columns'>('app_view_mode');
  const { preferences: savedListDensity, savePreferences: saveListDensity } = usePreferences<ListDensity>('list_density');
  const { preferences: savedGridDensity, savePreferences: saveGridDensity } = usePreferences<GridDensity>('grid_density');
  const { preferences: savedSplitView, savePreferences: saveSplitView } = usePreferences<boolean>('app_split_view');

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'columns'>('grid');
  const [listDensity, setListDensity] = useState<ListDensity>('comfortable');
  const [gridDensity, setGridDensity] = useState<GridDensity>('standard');
  const [isSplitView, setIsSplitView] = useState(false);

  useEffect(() => { if (savedViewMode) setViewMode(savedViewMode); }, [savedViewMode]);
  useEffect(() => { if (savedListDensity) setListDensity(savedListDensity); }, [savedListDensity]);
  useEffect(() => { if (savedGridDensity) setGridDensity(savedGridDensity); }, [savedGridDensity]);
  useEffect(() => { 
    if (savedSplitView !== null && savedSplitView !== undefined) setIsSplitView(savedSplitView); 
  }, [savedSplitView]);

  const handleViewModeChange = (mode: 'grid' | 'list' | 'columns') => { setViewMode(mode); saveViewMode(mode); };
  const handleListDensityChange = (density: ListDensity) => { setListDensity(density); saveListDensity(density); };
  const handleGridDensityChange = (density: GridDensity) => { setGridDensity(density); saveGridDensity(density); };
  const handleSplitViewToggle = () => {
    const newVal = !isSplitView;
    setIsSplitView(newVal);
    saveSplitView(newVal);
  };

  return {
    viewMode,
    setViewMode: handleViewModeChange,
    listDensity,
    setListDensity: handleListDensityChange,
    gridDensity,
    setGridDensity: handleGridDensityChange,
    isSplitView,
    toggleSplitView: handleSplitViewToggle
  };
}