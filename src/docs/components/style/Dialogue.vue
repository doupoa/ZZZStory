<!-- 对话组件 -->

<script lang="ts">
import { computed } from 'vue';

const roles = {// 第一个值为主色,第二个值为背景色
    "random_play": { //录像店
        "铃": ["#254fff", "#fd802dbf"],
        "哲": ["#ffffff", "#fd802dbf"],
        "Fairy": ["#1e3c72", "#1e3c7233"],
        "(蓝发少女)": ["#254fff", "#fd802dbf"],
        "(灰发少年)": ["#ffffff", "#fd802dbf"]
    },

    "cunning_hares": { //狡兔屋
        "安比": ["#b3cc58", "#C8E16C33"],
        "比利": ["#cc4f4b", "#AF3E3A33"],
        "妮可": ["#cd8583", "#E6ADAA33"],
        "猫又": ["#A0351C", "#A0351C33"],
        "(粉毛长发少女)": ["#cd8583", "#E6ADAA33"],
        "(白毛短发少女)": ["#cc4f4b", "#AF3E3A33"]
    },
    "belobog_heavy_industries": {}, // 白祇重工
    "sons_of_calydon": {},// 卡吕冬之子
    "mockingbird": {}, //反舌鸟

    "other": { "npc": ["dodgerblue", "#7c7c7c46"] } //其他角色

}
export default {
    props: {
        role: {
            type: String,
            required: true,
        }
    },
    setup(props) {
        const roleColors = computed(() => {
            let colors = ['dodgerblue', "#7c7c7c46"]; // 默认颜色
            // role 直接为角色名称，阵营名称仅做分类用
            console.log(Object.keys(roles))
            for (const camp of Object.keys(roles)) {
                const campRoles = roles[camp];
                if (campRoles[props.role]) {
                    colors = campRoles[props.role];
                    break;
                }
            }
            return colors;
        });

        return { roleColors };
    }
}
</script>
<template>
    <div class="dialogue">
        <span class="character" :style="{ color: roleColors[0], background: roleColors[1] }">{{ role }}</span>
        <slot></slot>
    </div>
</template>
