export class BoundaryConstraint {
  static ConstraintMode = {
    EnforceConnector: "EnforceConnector",
    ExcludeConnector: "ExcludeConnector",
  };

  static ConstraintDirection = {
    Up: "Up",
    Down: "Down",
    Horizontal: "Horizontal",
  };

  constructor() {
    /**
     * @type {number}
     */
    this.relativeY = 0;

    /**
     * @type {ConstraintDirection}
     */
    this.direction = BoundaryConstraint.ConstraintDirection.Up;

    /**
     * @type {ConstraintMode}
     */
    this.mode = BoundaryConstraint.ConstraintMode.EnforceConnector;
    this.connector = 0;
  }
}
