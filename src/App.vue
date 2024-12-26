<template>
    <div>
        <router-view />
    </div>
</template>
<script setup>
function setFontSize () {
    const screenWidth = window.innerWidth;
    const baseWidth = 375; // 基准宽度（常用 375px）
    const baseFontSize = 16; // 基准 font-size（16px）

    // 计算比例
    const fontSize = (screenWidth / baseWidth) * baseFontSize;

    // 设置 html 元素的 font-size
    document.documentElement.style.fontSize = `${fontSize}px`;
}

// 初次加载时设置 font-size
setFontSize();

// 在窗口尺寸变化时重新设置 font-size
window.addEventListener('resize', setFontSize);

</script>

<style lang='scss' scoped></style>
