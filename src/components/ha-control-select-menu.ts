import { SelectBase } from "@material/mwc-select/mwc-select-base";
import { mdiMenuDown } from "@mdi/js";
import { css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import { ifDefined } from "lit/directives/if-defined";
import { debounce } from "../common/util/debounce";
import { nextRender } from "../common/util/render-status";
import "./ha-icon";
import type { HaIcon } from "./ha-icon";
import "./ha-ripple";
import "./ha-svg-icon";
import type { HaSvgIcon } from "./ha-svg-icon";

@customElement("ha-control-select-menu")
export class HaControlSelectMenu extends SelectBase {
  @query(".select") protected mdcRoot!: HTMLElement;

  @query(".select-anchor") protected anchorElement!: HTMLDivElement | null;

  @property({ type: Boolean, attribute: "show-arrow" })
  public showArrow = false;

  @property({ type: Boolean, attribute: "hide-label" })
  public hideLabel = false;

  public override render() {
    const classes = {
      "select-disabled": this.disabled,
      "select-required": this.required,
      "select-invalid": !this.isUiValid,
      "select-no-value": !this.selectedText,
    };

    const labelledby = this.label && !this.hideLabel ? "label" : undefined;
    const labelAttribute =
      this.label && this.hideLabel ? this.label : undefined;

    return html`
      <div class="select ${classMap(classes)}">
        <input
          class="formElement"
          .name=${this.name}
          .value=${this.value}
          hidden
          ?disabled=${this.disabled}
          ?required=${this.required}
        />
        <!-- @ts-ignore -->
        <div
          class="select-anchor"
          aria-autocomplete="none"
          role="combobox"
          aria-expanded=${this.menuOpen}
          aria-invalid=${!this.isUiValid}
          aria-haspopup="listbox"
          aria-labelledby=${ifDefined(labelledby)}
          aria-label=${ifDefined(labelAttribute)}
          aria-required=${this.required}
          @focus=${this.onFocus}
          @blur=${this.onBlur}
          @click=${this.onClick}
          @keydown=${this.onKeydown}
        >
          ${this.renderIcon()}
          <div class="content">
            ${this.hideLabel
              ? nothing
              : html`<p id="label" class="label">${this.label}</p>`}
            ${this.selectedText
              ? html`<p class="value">${this.selectedText}</p>`
              : nothing}
          </div>
          ${this.renderArrow()}
          <ha-ripple .disabled=${this.disabled}></ha-ripple>
        </div>
        ${this.renderMenu()}
      </div>
    `;
  }

  private renderArrow() {
    if (!this.showArrow) return nothing;

    return html`
      <div class="icon arrow">
        <ha-svg-icon .path=${mdiMenuDown}></ha-svg-icon>
      </div>
    `;
  }

  private renderIcon() {
    const index = this.mdcFoundation?.getSelectedIndex();
    const items = this.menuElement?.items ?? [];
    const item = index != null ? items[index] : undefined;
    const defaultIcon = this.querySelector("[slot='icon']");
    const icon = (item?.querySelector("[slot='graphic']") ?? null) as
      | HaSvgIcon
      | HaIcon
      | null;

    if (!defaultIcon && !icon) {
      return null;
    }

    return html`
      <div class="icon">
        ${icon && icon.localName === "ha-svg-icon" && "path" in icon
          ? html`<ha-svg-icon .path=${icon.path}></ha-svg-icon>`
          : icon && icon.localName === "ha-icon" && "icon" in icon
            ? html`<ha-icon .path=${icon.icon}></ha-icon>`
            : html`<slot name="icon"></slot>`}
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("translations-updated", this._translationsUpdated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "translations-updated",
      this._translationsUpdated
    );
  }

  private _translationsUpdated = debounce(async () => {
    await nextRender();
    this.layoutOptions();
  }, 500);

  static override styles = [
    css`
      :host {
        display: inline-block;
        --control-select-menu-text-color: var(--primary-text-color);
        --control-select-menu-background-color: var(--disabled-color);
        --control-select-menu-background-opacity: 0.2;
        --control-select-menu-border-radius: 14px;
        --control-select-menu-height: 48px;
        --control-select-menu-padding: 6px 10px;
        --mdc-icon-size: 20px;
        --ha-ripple-color: var(--secondary-text-color);
        font-size: 14px;
        line-height: 1.4;
        width: auto;
        color: var(--primary-text-color);
        -webkit-tap-highlight-color: transparent;
      }
      .select-anchor {
        height: var(--control-select-menu-height);
        padding: var(--control-select-menu-padding);
        overflow: hidden;
        position: relative;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;
        border-radius: var(--control-select-menu-border-radius);
        box-sizing: border-box;
        outline: none;
        overflow: hidden;
        background: none;
        /* For safari border-radius overflow */
        z-index: 0;
        transition: color 180ms ease-in-out;
        gap: 10px;
        width: 100%;
        user-select: none;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.25px;
      }
      .content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        width: 0;
        flex-grow: 1;
        overflow: hidden;
      }

      .content p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        min-width: 0;
        width: 100%;
        margin: auto;
      }

      .arrow {
        margin-left: -10px;
        margin-inline-end: initial;
        margin-inline-start: -10px;
        direction: var(--direction);
      }

      .label {
        font-size: 0.85em;
        letter-spacing: 0.4px;
      }

      .select-no-value .label {
        font-size: inherit;
        line-height: inherit;
        letter-spacing: inherit;
      }

      .select-anchor:focus-visible {
        --control-select-menu-background-opacity: 0.4;
      }

      .select-anchor::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: var(--control-select-menu-background-color);
        transition:
          background-color 180ms ease-in-out,
          opacity 180ms ease-in-out;
        opacity: var(--control-select-menu-background-opacity);
      }

      .select-disabled .select-anchor {
        cursor: not-allowed;
        color: var(--disabled-color);
      }

      mwc-menu {
        --mdc-shape-medium: 8px;
      }
      mwc-list {
        --mdc-list-vertical-padding: 0;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-control-select-menu": HaControlSelectMenu;
  }
}
