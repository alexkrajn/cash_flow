<template>
  <div class="flex relative mt-8 lg:mt-0 lg:py-4 lg:pl-8 lg:before:content-[''] lg:before:border-l lg:before:border-gray-200 lg:before:absolute lg:before:left-0 lg:before:bottom-1/2 lg:before:h-1/2 lg:before:-translate-y-1/2 lg:after:content-[''] lg:after:border-l lg:after:border-gray-200 lg:after:absolute lg:after:left-0 lg:after:top-1/2 lg:after:h-1/2 lg:after:translate-y-1/2 first:before:hidden last:after:hidden">
    <div class="flex items-center justify-center w-8 h-8 text-gray-600 lg:absolute lg:top-1/2 lg:-left-6 lg:-translate-y-1/2 lg:w-12 lg:h-12 lg:border lg:border-gray-200 lg:bg-white lg:rounded-lg">
      <slot name="icon"></slot>
    </div>
    <div class="flex-1 ml-4 lg:ml-0">
      <h3 class="text-lg font-medium mb-2 text-gray-900">
        <slot name="heading"></slot>
      </h3>
      <div class="text-gray-600">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

