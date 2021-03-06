import React, { memo, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { set } from 'src/util/date';
import CalendarContext, { DefaultContext } from 'src/CalendarContext';
import classnames from 'src/util/classnames';
import { SharedPanelProps } from 'src/view/interface';
import TBody from 'src/view/TBody';
import { DisabledFunc } from 'src/interface';

import getChangedValue from './getChangedValue';

type MonthPanelProps = Omit<SharedPanelProps, 'onCurrentChange'> & { disabledMonth?: DisabledFunc };

const C_COL = 3;
const C_ROW = 4;

const defaultMonths = DefaultContext.locale.months;

const MonthPanel = ({ now, value, onChange, current, disabledMonth }: MonthPanelProps) => {
    const valueYear = useMemo(() => value?.getFullYear(), [value]);
    const valueMonth = useMemo(() => value?.getMonth(), [value]);
    const currentYear = useMemo(() => current?.getFullYear(), [current]);
    const nowYear = useMemo(() => now?.getFullYear(), [now]);
    const nowMonth = useMemo(() => now?.getMonth(), [now]);
    const { locale, prefixCls } = useContext(CalendarContext);
    const months = locale?.months || defaultMonths;

    // use ref to reduce reRender
    const currentRef = useRef(current);
    const valueRef = useRef(value);
    useEffect(() => {
        currentRef.current = current;
        valueRef.current = value;
    }, [current, value]);

    const cells = useMemo(() => {
        const count = C_COL * C_ROW;
        const cells = [];
        const activeCls = prefixCls + '-active';
        const disabledCls = prefixCls + '-disabled';
        const nowCls = prefixCls + '-now';
        for (let i = 0; i < count; i++) {
            const active = currentYear === valueYear && valueMonth === i;
            const isNow = currentYear === nowYear && nowMonth === i;
            const disabled = disabledMonth?.(set(current, i, 'month'), value);
            const cellInfo = {
                children: months[i],
                disabled,
                value: { year: currentYear, month: i },
                className: classnames(active && activeCls, isNow && nowCls, disabled && disabledCls)
            };
            cells.push(cellInfo);
        }
        return cells;
    }, [prefixCls, currentYear, valueYear, valueMonth, nowYear, nowMonth, disabledMonth, current, value, months]);

    const onMonthClick = useCallback(
        (index: number) => {
            const cellInfo = cells[index];
            if (cellInfo.disabled) return;
            const changedValue = getChangedValue(cellInfo.value, currentRef.current, valueRef.current);
            onChange(changedValue);
        },
        [cells, onChange]
    );

    const cls = useMemo(
        () => ({
            table: prefixCls + '-table'
        }),
        [prefixCls]
    );

    return (
        <div className={cls.table}>
            <TBody cells={cells} onCellClick={onMonthClick} col={C_COL} row={C_ROW} mode={'month'} />
        </div>
    );
};

export default memo(MonthPanel);
