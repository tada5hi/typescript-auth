/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@authup/core-kit';
import type { SlotsType } from 'vue';
import { defineComponent } from 'vue';
import type { Scope } from '@authup/core-kit';
import type { ListSlotsType } from '../../core';
import {
    TranslatorTranslationDefaultKey,
    TranslatorTranslationGroup,
    TranslatorTranslationVuecsKey,
    createList,
    defineListEvents,
    defineListProps,
    useTranslation,
} from '../../core';

export const AScopes = defineComponent({
    props: defineListProps<Scope>(),
    slots: Object as SlotsType<ListSlotsType<Scope>>,
    emits: defineListEvents<Scope>(),
    setup(props, ctx) {
        const { render } = createList({
            type: DomainType.SCOPE,
            props,
            setup: ctx,
        });

        const translationName = useTranslation({
            group: TranslatorTranslationGroup.DEFAULT,
            key: TranslatorTranslationDefaultKey.SCOPES,
        });

        const translation = useTranslation({
            group: TranslatorTranslationGroup.VUECS,
            key: TranslatorTranslationVuecsKey.NO_MORE,
            data: {
                name: translationName,
            },
        });

        return () => render({
            noMore: {
                content: translation.value,
            },
        });
    },
});

export default AScopes;
